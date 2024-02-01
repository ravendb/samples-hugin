const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

function getUserLink(userId) {
  const [_, community, id] = userId.split('/');
  switch (community) {
    case "stackoverflow":
      return `https://stackoverflow.com/users/${id}`;
    case "serverfault":
      return `https://serverfault.com/users/${id}`;
    case "superuser":
      return `https://superuser.com/users/${id}`;
    case "askubuntu":
      return `https://askubuntu.com/users/${id}`;
    case "mathoverflow":
      return `https://mathoverflow.net/users/${id}`;
    case "stackapps":
      return `https://stackapps.com/users/${id}`;
    case "rapsberrypi":
    case "unix":
    default:
      return `https://${community}.stackexchange.com/users/${id}`;
  }
}

function getUserName(userId, users) {
  const user = users[userId];
  if (!user) return userId;
  return users[userId].DisplayName;
}

function formatDateToRelativeTime(dateStr) {
  if (!dateStr || !isValidDate(dateStr)) return "";
  const [seconds, minutes, hours, days] = calculateTimeDifference(dateStr);

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.toLocaleString("en", { month: "short" });
  const day = date.getDate();
  const currYear = new Date().getFullYear();
  if (currYear > year)
    return `${month} ${day}, ${year} at ${date.toTimeString().slice(0, 5)}`;
  if (days > 0) return `${month} ${day} at ${date.toTimeString().slice(0, 5)}`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  return seconds === 0 ? "now" : `${seconds} seconds ago`;
}

function calculateTimeDifference(dateStr) {
  const timestamp = new Date(dateStr).getTime();
  const now = Date.now();
  const difference = now - timestamp;
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  const hours = Math.floor((minutes / MINUTES_IN_HOUR) * 10) / 10;
  const days = Math.floor(hours / HOURS_IN_DAY);
  return [seconds, minutes, hours, days];
}

function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export { formatDateToRelativeTime, getUserName, getUserLink };
