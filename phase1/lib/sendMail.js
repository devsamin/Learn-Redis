export const sendMail = async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10000);
  });
};
console.log("Email Send Successfully");
