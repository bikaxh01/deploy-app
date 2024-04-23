import express from "express";
import { customAlphabet } from "nanoid";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

const app = express();
const PORT = 3000;

app.use(express.json())

const ecs = new ECSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const config = {
  cluster: "arn:aws:ecs:us-east-1:855084276126:cluster/build-cluster",
  task: "arn:aws:ecs:us-east-1:855084276126:task-definition/builder-task",
};

const nanoid = customAlphabet("123456780");

app.post("/post", async (req, res) => {
  const { gitURL } = req.body;

  console.log(gitURL);
  const id = nanoid(4);
  const projectID = id;

  // running container
  try {

    // configuring runtask
    const command =  new RunTaskCommand({
      cluster: config.cluster,
      taskDefinition: config.task,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            "subnet-04daa19b21e0a5ac4",
            "subnet-056cd8415947e9c69",
            "subnet-07a5f559ce40ab497",
            "subnet-0daaeba71f7efe681",
          ],
          securityGroups: ["sg-0f87fbd1bc91678e9"],
          assignPublicIp: "ENABLED",
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              { name: "GIT_REPO_URL", value: gitURL },
              { name: "PROJECT_ID", value: projectID },
            ],
          },
        ],
      },
    });

    await ecs.send(command);
    return res.json({
      status: "queued",
      data: { projectID, url: `http://${projectID}.localhost:8000` },
    });
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server Runnign at ${PORT}`));
