import { exec } from "child_process";
import { fileURLToPath } from 'url';
import path from "path";
import fs from "fs";
import mime from 'mime-types'
import  {S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
    region:'us-east-1',
    credentials:{
        accessKeyId:'',
        secretAccessKey:''
    }
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectID = process.env.PROJECT_ID 

async function init() {

  try {
    console.log("Executting...");
    console.log("ENV:",projectID);
    const dirPath = path.join(__dirname, 'output')
     
    console.log("PATH: ",dirPath);
    // running build command
    const runBuild = exec(`cd ${dirPath} && npm  install && npm run build`);
  
    const list =  exec (`cd ${dirPath} && ls`)
  
    console.log("list");
    list.stdout.on('data',(data)=>console.log(data.toString()))
  
    // getting terminal output
    runBuild.stdout.on("data", (data) => console.log("SUCCESS", data.toString()));
  
    runBuild.stdout.on("error", (data) => console.log("ERROR", data.toString()));
  
    runBuild.on("close",  async () => {
      console.log("Build Completed");
  
    
  
      const distFolder = path.join(__dirname, "output", "dist");
  
  
      const dirPath = fs.readdirSync(distFolder, { recursive: true });
  
      // iterating over files
      for ( const file of dirPath ){
  
      
        const filepath = path.join(distFolder, file)
  
          console.log(`Uploading ${file}`);
  
          if(fs.lstatSync(filepath).isDirectory()) continue;
           
          // Uploading to bucket
          const command = new PutObjectCommand({
              Bucket:'deploy--project',
              Key:`__output/${projectID}/${file}`,
              Body:fs.createReadStream(filepath),
              ContentType: mime.lookup(filepath)
          })
  
          await s3.send(command)
  
          console.log(`Uploaded ${filepath}`);
      }
    });
  
    console.log("Build Completed...");
  } catch (error) {
    console.log(error.message);
  }
}


init()