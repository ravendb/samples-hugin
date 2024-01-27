import { httpService } from "./http.service";


export async function getCommunities() {
  return await httpService.get("communities");
}

export async function queryQuestions(args) {
  return await httpService.get("search", args);
}

const demoQuesiton = {
  Community: "raspberrypi",
  AcceptedAnswerId: 0,
  CreationDate: "2023-06-21T00:26:45.3300000",
  Score: 0,
  ViewCount: 748,
  Body: "<p>I am new to Raspberry Pi and I want to do real-time object detection using YOLOv8 tentatively (will change if the fps is too low). I realize that by using the code below, it can't detect Pi Cam as the source and run into an error. The Pi Cam works fine with <code>libcamera-hello</code> and managed to capture photo everything. I also enabled the legacy camera feature. The code works fine with USB webcam.</p>\n<p>Code:</p>\n<pre><code>from ultralytics import YOLO\n\nmodel = YOLO('best.pt')\nresults = model.predict(source=0, show=True)\n\nprint(results)\n</code></pre>\n<p>Error:\nConnectionError: 1/1: 0... Failed to read images from 0</p>\n<p>I thought of one solution which is to capture image every time and pass to the model to predict, but it only produces an image every 2.5s. I guess maybe the model reinitialize every time it predicts an image again.</p>\n<p>Code:</p>\n<pre><code>import cv2\nfrom picamera2 import Picamera2\nfrom ultralytics import YOLO\nimport numpy as np\n\ncv2.startWindowThread()\n\npicam2 = Picamera2()\npicam2.configure(picam2.create_preview_configuration(main={&quot;format&quot;: 'XRGB8888', &quot;size&quot;: (640, 480)}))\npicam2.start()\n\nmodel = YOLO('best.pt')\n\nwhile True:\n    im = picam2.capture_array()\n\n    img = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)\n    results = model.predict(img)\n\n    for box in results[0].boxes:\n        x = int(np.floor(box[0].xywh[0][0].item()))\n        y = int(np.floor(box[0].xywh[0][1].item()))\n        w = int(np.floor(box[0].xywh[0][2].item()))\n        h = int(np.floor(box[0].xywh[0][3].item()))\n        \n        cv2.rectangle(im, (x, y), (x + w, y + h), (0, 255, 0))\n\n    cv2.imshow(&quot;Camera&quot;, im)\n</code></pre>\n<p>So, there are two questions in my mind:</p>\n<ol>\n<li>How to set Pi Cam as the default <code>source=0</code> to have real-time object detection using YOLOv8?</li>\n<li>How to prevent reinitialization of the YOLO model for image prediction? (If my guess is correct)</li>\n</ol>\n",
  Owner: "users/raspberrypi/155333",
  LastEditor: null,
  LastEditDate: null,
  Title: "How to stream from Pi Camera to YOLO model?",
  Tags: ["camera", "webcam", "picamera", "streaming"],
  FavoriteCount: 0,
  Answers: [
    {
      Id: 143637,
      CreationDate: "2023-07-05T01:54:00.9270000",
      Score: 0,
      ViewCount: 0,
      Body: "<p>I got an idea:</p>\n<ol>\n<li><p>to see if the Pi Cam can be detected by your computer<br />\nin cmd:\n'pip install pygame'<br />\nand run the following python code<br />\n<code>import pygame.camera</code><br />\n<code>pygame.camera.init()</code><br />\n<code>camera_id_list = pygame.camera.list_cameras()</code><br />\n<code>print(camera_id_list)</code><br />\nIf the result comes out to be 0 which is the id of your computer own cam, you can't use the Pi cam directly.If there are other numbers in the result,  you can try by changing to 'source=1' for example.</p>\n</li>\n<li><p>to get other components provided by raspberrypi<br />\nI don't have an intimate knowledge of this, so I can't offer you some valuable suggestions.</p>\n</li>\n<li><p>to read the picamera document<br />\nclick the link: <a href=\"https://picamera.readthedocs.io/en/release-1.13/recipes2.html\" rel=\"nofollow noreferrer\">https://picamera.readthedocs.io/en/release-1.13/recipes2.html</a><br />\nand you can see something helpful for you in the section <code>4.2 Capturing to an OpenCV object</code></p>\n</li>\n</ol>\n",
      Owner: "users/raspberrypi/155566",
      LastEditor: "users/raspberrypi/155566",
      LastEditDate: "2023-07-05T03:20:38.4070000",
      Comments: [],
    },
    {
      Id: 145169,
      CreationDate: "2023-12-02T13:52:18.2100000",
      Score: 0,
      ViewCount: 0,
      Body: '<p>Check out the Ultralytics docs on this: <a href="https://docs.ultralytics.com/guides/raspberry-pi/#quick-start-with-yolov8" rel="nofollow noreferrer">https://docs.ultralytics.com/guides/raspberry-pi/#quick-start-with-yolov8</a></p>\n',
      Owner: "users/raspberrypi/157763",
      LastEditor: null,
      LastEditDate: null,
      Comments: [
        {
          Id: 248153,
          Score: 0,
          Text: "While this link may answer the question, it is better to include the essential parts of the answer here and provide the link for reference.  Link-only answers can become invalid if the linked page changes. - [From Review](/review/late-answers/133023)",
          CreationDate: "2023-12-03T01:07:08.5900000",
          User: "users/raspberrypi/8697",
        },
      ],
    },
  ],
  Comments: [
    {
      Id: 248153,
      Score: 0,
      Text: "While this link may answer the question, it is better to include the essential parts of the answer here and provide the link for reference.  Link-only answers can become invalid if the linked page changes. - [From Review](/review/late-answers/133023)",
      CreationDate: "2023-12-03T01:07:08.5900000",
      User: "users/raspberrypi/8697",
    },
  ],
  "@metadata": {
    "@collection": "Questions",
    "Raven-Clr-Type": "Question, StackExchange.Import",
  },
};

export async function getQuestion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(demoQuesiton);
    }, 2000);
  });
}
