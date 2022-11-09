import fs from "fs";

async function readDirectory() {
  const testDir = "./temp";

  fs.readdir(testDir, (err, files) => {
    files.forEach(file => {
      console.info(file);
    });
  });
}

export default readDirectory;
