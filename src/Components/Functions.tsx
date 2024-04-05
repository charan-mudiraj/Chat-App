export const getUniqueID = () => {
  const date = new Date();
  // 16-digit ID
  const id =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0") +
    date.getHours().toString().padStart(2, "0") +
    date.getMinutes().toString().padStart(2, "0") +
    date.getSeconds().toString().padStart(2, "0") +
    date.getMilliseconds().toString().substring(0, 2);

  return id;
};

export const getCurrentTime = () => {
  const date = new Date();
  // 07:57 PM
  const period = date.getHours() < 12 ? "AM" : "PM";
  const hours = date.getHours() % 12 || 12;
  const time =
    hours + ":" + date.getMinutes().toString().padStart(2, "0") + " " + period;
  return time;
};

export function generateRandomColor(transparency = 1) {
  // Generate random values for red, green, and blue channels
  const red = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const green = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const blue = Math.floor(Math.random() * 256); // Random value between 0 and 255

  // Ensure transparency value is within range [0, 1]
  transparency = Math.min(1, Math.max(0, transparency));

  // Construct the color string in RGBA format with the provided transparency
  const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${transparency})`;

  return rgbaColor;
}

export const downlaodFile = async (url: string, fileName: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(new Blob([blob]));
    const linkElement = document.createElement("a");
    linkElement.href = blobUrl;
    linkElement.setAttribute("download", fileName);
    document.body.appendChild(linkElement);
    linkElement.click();
    linkElement.parentNode.removeChild(linkElement);
  } catch (e) {
    console.log(e);
  }
};
