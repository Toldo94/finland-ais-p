export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const messageLogger = (article, message) => {
  const fullMessage = `[${article.articleNr}](${article.url}): ${message}`;
  console.log(fullMessage);
  return fullMessage;
};

export const createTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
  .toString()
  .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
  .getHours()
  .toString()
  .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

