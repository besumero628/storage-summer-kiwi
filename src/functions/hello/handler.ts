import { App, AwsLambdaReceiver } from "@slack/bolt";

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver
});

app.message('hello',async ({message, say}) => {
  await say(`Hello World`)
})

const hello: any = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

export const main = hello;
