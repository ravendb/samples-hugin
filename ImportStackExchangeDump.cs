using System.Xml;
using System.Xml.Serialization;
using SharpCompress.Archives;
using Raven.Client.Documents;
using System.Diagnostics;
using Raven.Client.Documents.Session;

using var store = new DocumentStore
{
    Urls = new[] { "http://127.0.0.1:8080" },
    Database = "Hugin",
    Conventions =
    {
        MaxNumberOfRequestsPerSession = int.MaxValue
    }
}.Initialize();

var sp = Stopwatch.StartNew();

string file = Environment.GetCommandLineArgs()[1];

string prefix = Environment.GetCommandLineArgs()[2];

using var archive = ArchiveFactory.Open(file);
var answerToQuestion = new Dictionary<int, int>();
var state = new State { Session = store.OpenAsyncSession() };

using (var users = archive.Entries.Single(x => x.Key == "Users.xml").OpenEntryStream())
{
    foreach(var user in ImportFrom<xUser>(GetReader(users)))
    {
        await Import(user, store, answerToQuestion, state);
    }
}
using (var posts = archive.Entries.Single(x => x.Key == "Posts.xml").OpenEntryStream())
{
    foreach (var post in ImportFrom<xPost>(GetReader(posts)))
    {
        if (post.PostTypeId == 2)
        {
            answerToQuestion[post.Id] = post.ParentId;
        }
        if (post.PostTypeId is 1 or 2)
        {
            await Import(post, store, answerToQuestion, state);
        }
    }
}

using (var posts = archive.Entries.Single(x => x.Key == "Comments.xml").OpenEntryStream())
{
    foreach (var comment in ImportFrom<xComment>(GetReader(posts)))
    {
        await Import(comment, store, answerToQuestion, state);
    }
}

using (var comments = archive.Entries.Single(x => x.Key == "Posts.xml").OpenEntryStream())
{
    foreach (var comment in ImportFrom<xComment>(GetReader(comments)))
    {
        await Import(comment, store, answerToQuestion, state);
    }
}
using (var comments = archive.Entries.Single(x => x.Key == "Badges.xml").OpenEntryStream())
{
    foreach (var badge in ImportFrom<xBadge>(GetReader(comments)))
    {
        await Import(badge, store, answerToQuestion, state);
    }
}

await state.Session.SaveChangesAsync();


Console.WriteLine(sp.Elapsed);

async Task Import(object item, IDocumentStore store, Dictionary<int, int> answerToQuestion, State state)
{
    if (state.Writes > 1024)
    {
        await state.Session.SaveChangesAsync();
        state.Session.Dispose();
        state.Session = store.OpenAsyncSession();
        state.Writes = 0;
    }
    state.Writes++;
    switch (item)
    {
        case xPost post:
            {
                switch (post.PostTypeId)
                {
                    case 1: // question
                        {
                            var q = new Question
                            {
                                Id = "questions/" + prefix+"/" + post.Id,
                                Community = prefix,
                                AcceptedAnswerId = post.AcceptedAnswerId,
                                Answers = new(),
                                Body = post.Body,
                                Comments = new(),
                                CreationDate = post.CreationDate,
                                FavoriteCount = post.FavoriteCount,
                                LastEditDate = post.LastEditDate == DateTime.MinValue ? null : post.LastEditDate,
                                LastEditor = post.LastEditorUserId == 0 ? null : "users/" +prefix +"/" + post.LastEditorUserId,
                                Owner = "users/" + prefix + "/" + post.OwnerUserId,
                                Score = post.Score,
                                Tags = post.Tags.Split(new[] { '<', '>' }, StringSplitOptions.RemoveEmptyEntries),
                                Title = post.Title,
                                ViewCount = post.ViewCount
                            };
                            if (state.OutOfOrders.Remove(post.Id, out var ooo))
                            {
                                q.Answers = ooo;
                            }
                            await state.Session.StoreAsync(q, "questions/" + prefix + "/" + post.Id);
                            break;
                        }
                    case 2:// answer
                        {
                            var a = new Answer
                            {
                                Body = post.Body,
                                Comments = new(),
                                CreationDate = post.CreationDate,
                                Id = post.Id,
                                LastEditDate = post.LastEditDate == DateTime.MinValue ? null : post.LastEditDate,
                                LastEditor = post.LastEditorUserId == 0 ? null : "users/" + prefix + "/" + post.LastEditorUserId,
                                Owner = "users/" + prefix + "/" + post.OwnerUserId,
                                Score = post.Score,
                                ViewCount = post.ViewCount
                            };
                            answerToQuestion[post.Id] = post.ParentId;
                            var q = await state.Session.LoadAsync<Question>("questions/" + prefix + "/" + post.ParentId);
                            if (q == null)
                            {
                                if (state.OutOfOrders.TryGetValue(post.ParentId, out var ooo) == false)
                                {
                                    state.OutOfOrders[post.ParentId] = ooo = new List<Answer>();
                                }
                                ooo.Add(a);
                                return;
                            }
                            q.Answers.Add(a);
                            break;
                        }
                }
                break;
            }
        case xComment comment:
            {
                var c = new Comment
                {
                    CreationDate = comment.CreationDate,
                    Id = comment.Id,
                    Score = comment.Score,
                    Text = comment.Text,
                    User = "users/" + prefix + "/" + comment.UserId,
                };
                if (answerToQuestion.TryGetValue(comment.PostId, out var qId))
                {
                    var q = await state.Session.LoadAsync<Question>("questions/" + prefix + "/" + qId);
                    if (q == null)
                    {
                        Console.WriteLine("Missing question's answer: " + qId + " -> " + comment.PostId);
                        return;
                    }

                    try
                    {
                        q.Answers.Single(a => a.Id == comment.PostId).Comments.Add(c);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                        Console.WriteLine(comment.PostId + " -> " + qId);
                    }
                }
                else
                {
                    var q = await state.Session.LoadAsync<Question>("questions/" + prefix + "/" + comment.PostId);
                    if (q == null)
                    {
                        Console.WriteLine("Missing question: " + comment.PostId);
                        return;
                    }
                    q.Comments.Add(c);
                }
                break;
            }
        case xUser user:
            {
                var u = new User
                {
                    Community = prefix,
                    CreationDate = user.CreationDate,
                    Id = "users/" + prefix + "/" + user.Id,
                    AboutMe = user.AboutMe,
                    DisplayName = user.DisplayName,
                    DownVotes = user.DownVotes,
                    LastAccessDate = user.LastAccessDate,
                    Reputation = user.Reputation,
                    UpVotes = user.UpVotes,
                    Views = user.UpVotes,
                    Badges = new()
                };
                await state.Session.StoreAsync(u, "users/" + prefix + "/" + user.Id);
                break;
            }
        case xBadge badge:
            {
                var u = await state.Session.LoadAsync<User>("users/" + prefix + "/" + badge.UserId);
                if (u == null) return;
                u.Badges.Add(new Badge
                {
                    Date = badge.Date,
                    Name = badge.Name,
                    Rank = badge.Class switch
                    {
                        1 => "Gold",
                        2 => "Silver",
                        3 => "Bronze",
                        _ => null
                    },
                    TagBased = bool.Parse(badge.TagBased)
                });
                break;
            }
    }
}


IEnumerable<T> ImportFrom<T>(XmlReader reader)
{
    XmlSerializer serializer = new XmlSerializer(typeof(T));
    while (reader.Read())
    {
        if (reader.NodeType != XmlNodeType.Element)
            continue;
        yield return (T)serializer.Deserialize(reader);
    }
}

static XmlReader GetReader(Stream stream)
{
    var reader = XmlReader.Create(stream);
    reader.MoveToContent();
    return reader;
}
public class State
{
    public IAsyncDocumentSession Session;
    public int Writes;
    public Dictionary<int, List<Answer>> OutOfOrders = new();
}

[XmlRoot(ElementName = "row")]
public class xUser
{
    [Newtonsoft.Json.JsonIgnore]
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "Reputation")]
    public int Reputation { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
    [XmlAttribute(AttributeName = "DisplayName")]
    public string DisplayName { get; set; }
    [XmlAttribute(AttributeName = "LastAccessDate")]
    public DateTime LastAccessDate { get; set; }
    [XmlAttribute(AttributeName = "AboutMe")]
    public string AboutMe { get; set; }
    [XmlAttribute(AttributeName = "Views")]
    public int Views { get; set; }
    [XmlAttribute(AttributeName = "UpVotes")]
    public int UpVotes { get; set; }
    [XmlAttribute(AttributeName = "DownVotes")]
    public int DownVotes { get; set; }
}

[XmlRoot(ElementName = "row")]
public class xTag
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "TagName")]
    public string TagName { get; set; }
    [XmlAttribute(AttributeName = "Count")]
    public int Count { get; set; }
    [XmlAttribute(AttributeName = "ExcerptPostId")]
    public int ExcerptPostId { get; set; }
    [XmlAttribute(AttributeName = "WikiPostId")]
    public int WikiPostId { get; set; }
}



[XmlRoot(ElementName = "row")]
public class xBadge
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "UserId")]
    public int UserId { get; set; }
    [XmlAttribute(AttributeName = "Name")]
    public string Name { get; set; }
    [XmlAttribute(AttributeName = "Date")]
    public DateTime Date { get; set; }
    [XmlAttribute(AttributeName = "Class")]
    public int Class { get; set; }
    [XmlAttribute(AttributeName = "TagBased")]
    public string TagBased { get; set; }
}




[XmlRoot(ElementName = "row")]
public class xComment
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "PostId")]
    public int PostId { get; set; }
    [XmlAttribute(AttributeName = "Score")]
    public int Score { get; set; }
    [XmlAttribute(AttributeName = "Text")]
    public string Text { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
    [XmlAttribute(AttributeName = "UserId")]
    public int UserId { get; set; }
    [XmlAttribute(AttributeName = "ContentLicense")]
    public string ContentLicense { get; set; }
}




[XmlRoot(ElementName = "row")]
public class xPostHistory
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "PostHistoryTypeId")]
    public int PostHistoryTypeId { get; set; }
    [XmlAttribute(AttributeName = "PostId")]
    public int PostId { get; set; }
    [XmlAttribute(AttributeName = "RevisionGUID")]
    public string RevisionGUID { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
    [XmlAttribute(AttributeName = "UserId")]
    public int UserId { get; set; }
    [XmlAttribute(AttributeName = "Text")]
    public string Text { get; set; }
    [XmlAttribute(AttributeName = "ContentLicense")]
    public string ContentLicense { get; set; }
}


[XmlRoot(ElementName = "row")]
public class xPostLink
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
    [XmlAttribute(AttributeName = "PostId")]
    public int PostId { get; set; }
    [XmlAttribute(AttributeName = "RelatedPostId")]
    public int RelatedPostId { get; set; }
    [XmlAttribute(AttributeName = "LinkTypeId")]
    public int LinkTypeId { get; set; }
}




[XmlRoot(ElementName = "row")]
public class xPost
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "PostTypeId")]
    public int PostTypeId { get; set; }
    [XmlAttribute(AttributeName = "ParentId")]
    public int ParentId { get; set; }
    [XmlAttribute(AttributeName = "AcceptedAnswerId")]
    public int AcceptedAnswerId { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
    [XmlAttribute(AttributeName = "Score")]
    public int Score { get; set; }
    [XmlAttribute(AttributeName = "ViewCount")]
    public int ViewCount { get; set; }
    [XmlAttribute(AttributeName = "Body")]
    public string Body { get; set; }
    [XmlAttribute(AttributeName = "OwnerUserId")]
    public int OwnerUserId { get; set; }
    [XmlAttribute(AttributeName = "LastEditorUserId")]
    public int LastEditorUserId { get; set; }
    [XmlAttribute(AttributeName = "LastEditDate")]
    public DateTime LastEditDate { get; set; }
    [XmlAttribute(AttributeName = "LastActivityDate")]
    public DateTime LastActivityDate { get; set; }
    [XmlAttribute(AttributeName = "Title")]
    public string Title { get; set; }
    [XmlAttribute(AttributeName = "Tags")]
    public string Tags { get; set; }
    [XmlAttribute(AttributeName = "AnswerCount")]
    public int AnswerCount { get; set; }
    [XmlAttribute(AttributeName = "CommentCount")]
    public int CommentCount { get; set; }
    [XmlAttribute(AttributeName = "FavoriteCount")]
    public int FavoriteCount { get; set; }
    [XmlAttribute(AttributeName = "ContentLicense")]
    public string ContentLicense { get; set; }
}

[XmlRoot(ElementName = "row")]
public class xVote
{
    [XmlAttribute(AttributeName = "Id")]
    public int Id { get; set; }
    [XmlAttribute(AttributeName = "PostId")]
    public int PostId { get; set; }
    [XmlAttribute(AttributeName = "VoteTypeId")]
    public int VoteTypeId { get; set; }
    [XmlAttribute(AttributeName = "CreationDate")]
    public DateTime CreationDate { get; set; }
}
public class Question
{
    public string Id;
    public string Community;
    public int AcceptedAnswerId;
    public DateTime CreationDate;
    public int Score;
    public int ViewCount;
    public string Body;
    public string Owner;
    public string LastEditor;
    public DateTime? LastEditDate;
    public string Title;
    public string[] Tags;
    public int FavoriteCount;
    public List<Answer> Answers;
    public List<Comment> Comments;
}
public class Answer
{
    public int Id;
    public DateTime CreationDate;
    public int Score;
    public int ViewCount;
    public string Body;
    public string Owner;
    public string LastEditor;
    public DateTime? LastEditDate;
    public List<Comment> Comments;
}
public class Comment
{
    public int Id;
    public int Score;
    public string Text;
    public DateTime CreationDate;
    public string User;
}
public class User
{
    public string Community;
    public string Id;
    public int Reputation;
    public DateTime CreationDate;
    public string DisplayName;
    public DateTime LastAccessDate;
    public string AboutMe;
    public int Views;
    public int UpVotes;
    public int DownVotes;
    public List<Badge> Badges;
}
public class Badge
{
    public string Name;
    public DateTime Date;
    public bool TagBased;
    public string Rank;
}