export const getTimeStamp = () => {
  return new Date().getTime();
};

export const dateFormat = (inputDate: string) => {
  const date = new Date(inputDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  const formatted = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  return formatted;
};
