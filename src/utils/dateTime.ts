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

  const dateTime = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  const dateOnly = `${day} ${month} ${year}`;
  return { dateTime, dateOnly };
};

export const getTimeAgo = (dateString: string): string => {
  const updatedDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifferenceMs = currentDate.getTime() - updatedDate.getTime();

  const minutes = Math.floor(timeDifferenceMs / (1000 * 60));
  const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
  const days = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return `${months} month${months > 1 ? "s" : ""} ago`;
};
