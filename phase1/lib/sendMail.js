export const sendMail = async ({ email }) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
  console.log(`Email sent to ${email}`);
};
