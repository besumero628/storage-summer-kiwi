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

app.command('/event',async ({ack, body, client, logger}) => {
  await ack();

  try {
    const result = await client.views.open({
      // 適切な trigger_id を受け取ってから 3 秒以内に渡す
      trigger_id: body.trigger_id,
      // view の値をペイロードに含む
      view: {
        type: 'modal',
        // callback_id が view を特定するための識別子
        callback_id: 'scheduler',
        title: {
          type: 'plain_text',
          text: 'つどい君がイベントをお知らせします'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '※入力方法など決まってから注意書きなど…'
            }
          },
          {
            type: 'input',
            block_id: 'input_title',
            label: {
              type: 'plain_text',
              text: 'イベント名',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'title',
              placeholder: {
                type: 'plain_text',
                text: 'カレー食べ放題企画'
              }
            }
          },
          {
            type: 'input',
            block_id: 'input_date',
            label: {
              type: 'plain_text',
              text: '日時',
            },
            element: {
              type: 'datetimepicker',
              action_id: 'date'
            }
          },
          {
            type: 'input',
            block_id: 'input_place',
            label: {
              type: 'plain_text',
              text: '場所',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'place',
              placeholder: {
                type: 'plain_text',
                text: 'ハチ公前'
              }
            }
          },
          {
            type: 'input',
            block_id: 'input_description',
            label: {
              type: 'plain_text',
              text: '説明',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'description',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: '予算：\n募集人数：\n対象者：\n具体的な内容：'
              }
            }
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

app.view('scheduler', async ({ ack, body, view, client, logger }) => {
  // モーダルでのデータ送信リクエストを確認
  await ack();

  // block_id: block_1 という input ブロック内で action_id: input_a の場合の入力
  const title = view['state']['values']['input_title']['title'].value;
  let unixTime = view['state']['values']['input_date']['date'].selected_date_time;
  const place = view['state']['values']['input_place']['place'].value;
  const description = view['state']['values']['input_description']['description'].value;
  const organizer = body['user']['username']; // 途中です

  unixTime = unixTime + 60 * 60 * 9;
  const date = new Date(unixTime * 1000);

  // ユーザーにメッセージを送信
  try {
    await client.chat.postMessage({
      channel: process.env.TARGET_RECEIVER_CHANNEL_ID,
      text: `${organizer}さんがイベント「${title}」を提案したワン！\n集合場所：${place}\n日時　　：${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP').slice(0, -3)}\n他お知らせは下記をご参照下さいだわん！\n${description}`
    });
  }
  catch (error) {
    logger.error(error);
  }
});

const hello: any = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

export const main = hello;
