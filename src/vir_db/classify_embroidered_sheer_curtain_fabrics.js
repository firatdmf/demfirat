// I am importing the fs module from the builtin node. FS enables me to read and write files within the system
const fs = require("fs");
// const Papa = require("papaparse");
const { convertArrayToCSV } = require("convert-array-to-csv");
// since this is not react, we need to use require instead of below
// import { prisma } from "@/lib/prisma";
const { PrismaClient } = require("@prisma/client");
const currentUniqueArray = require("./products_embroidered_sheer_curtain_fabrics.json");
// import { PrismaClient } from "@prisma/client";
// const {PrismaClient} = require("@prisma/client")
// const prisma = new PrismaClient()
// below productsOld array is for reference purposes that I have used before. I am not using anymore.
let productsOld = [
  "12K201.jpg",
  "1002.jpg",
  "1089T.jpg",
  "1128_K23.jpg",
  "1193_K21-2.jpg",
  "1205-2.jpg",
  "1360_Kartela.jpg",
  "8015_Kartela-2.jpg",
  "8015_Kartela-3.jpg",
  "24402i_G112.jpg",
  "24402i_G112-2.jpg",
  "24402i_G113.jpg",
  "24402i_G113-2.jpg",
  "24402i_G113-3.jpg",
  "Manolya_1011.jpg",
  "Manolya_1013.jpg",
  "Sofya_Krem.jpg",
  "Turuva_Paris.jpg",
  "AP12001.jpg",
];
let uniqueArray = [];
const prisma = new PrismaClient();
// Below function determines if a character is a letter or not (True if it is a letter)
let isLetter = (str) => {
  return str.length === 1 && str.match(/[a-z]/i);
};

let designDate = (designName) => {
  let exists = false;
  for (let index = 0; index < currentUniqueArray.length; ++index) {
    let product = currentUniqueArray[index];
    if (product.design === designName) {
      exists = true;
      return product.date;
    }
  }
  return new Date().toJSON().slice(0, 10);
};

let classifyImage = (fileName, products) => {
  // lets create an empty object
  let object = {};
  // annex stands for T or I, for tasli and incili respectively
  let annex;
  let prefix;
  // takeout the file extension from the name of the file and store it in the design variable. This will be altered later on the code
  let design = fileName.split(".")[0];
  // console.log(design);
  // Initializing the variable imageNo
  let imageNo;
  // If the file name icludes - character, it means it has multiple images of this design and variant. So let's take the order number of that design+variant and assign to imageNo variable
  if (fileName.includes("-")) {
    imageNo = design.split("-")[1];
    // Since we have a multiple order we need to alter the design variable so we will eliminate the extra strings beside the design string. Which should be something like 1204 ideally
    design = design.split("-")[0];
  } else {
    // If we have no multiples. Let's set the imageNo to 1.
    imageNo = "1";
  }

  // Initializing the variable variant
  let variant;
  if (design.includes("_")) {
    // If we have the _ character, that means we have a variant stated. Let's save the variant, and alter the design variable again.
    variant = design.split("_")[1];
    design = design.split("_")[0];

    // If we have no "_", then let's set the variant to be an empty string
  } else {
    variant = "";
  }

  // Let's determine if the design has a tas or inci (This needs to updated for designs that have both inci and tas)
  // For that lets get the second last character
  let secondLastCharacter = design.charAt(design.length - 2);
  let thirdLastCharacter = design.charAt(design.length - 3);
  let lastCharacter = design.slice(-1);
  if (isLetter(lastCharacter)) {
    if (isLetter(thirdLastCharacter)) {
      annex = design.slice(-2);
      // console.log("hello", design, thirdLastCharacter);
      design = fileName.split(annex)[0];
    }
    // Now lets determine if it's a letter or not. If it is not a letter, and the character comes right after it is a letter, then it has a variant.
    else if (!isLetter(secondLastCharacter)) {
      // Take out the last character and store it in the variable called annex
      annex = design.slice(-1);
      // Let's once again filter out the extra strings from the design variable
      design = fileName.split(annex)[0];
    }
  } else {
    annex = "";
  }

  // Now at below, we determine if we already have this design in the folder/data
  // If there is, then we store their indexes from the products json file
  const productBoolean = products.findIndex((e) => e.design === design);
  // lets initialize a boolean variable and set it equal to false
  let exists = false;
  // if (productBoolean > -1 || variant ==="video") {
  if (productBoolean > -1) {
    exists = true;
  }
  if (isLetter(design[0])) {
    prefix = "";
    for (let i = 0; i < design.length; i++) {
      if (isLetter(design[i])) {
        prefix += design[i];
      }
    }
    design = design.replace(/\D/g, "");
  } else {
    if (design > 8000 && !isLetter(design[0])) {
      prefix = "K";
    } else {
      prefix = "N";
    }
  }

  // design = design.replace(/\D/g, "");

  object.prefix = prefix;
  object.name = fileName;
  object.design = design;
  object.annex = annex;
  object.variant = variant;
  object.imageNo = imageNo;
  // }
  return [object, exists];
};

//TRYING OUT FIRST
let classifyEachFile = (productFiles) => {
  let products = [];
  productFiles.map((item, index) => {
    let [object, exists] = classifyImage(item, products);
    // do not push the video ones
    // if(!exists && object.variant !== "video"){
    if(object.variant !== "video"){

      products.push(object);
    }
  });
  return products;
};

let removeDuplicates = (array) => {
  // below is when uniqueArray is just an array of design strings: ['1151','1164']
  // console.log(array);
  // newArray =  array.filter((item, index) => array.indexOf(item) === index);
  // console.log(newArray);
  // return newArray

  const uniqueMap = new Map();
  array.forEach((item) => {
    const key = `${item.design}-${item.prefix}`;
    uniqueMap.set(key, item);
  });
  return Array.from(uniqueMap.values());
};
let getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

// this part is not for files array but for the main object
let uniqueDesignsObject = (products) => {
  // let's create a unique array that just consists of unique design numbers, and their corresponding prefixes
  let uniqueArray = [];
  // let's get them all in uniqueArray
  products.map((productItem) => {
    // below ensures that we do not include folder names for our output
    if (productItem.design !== "") {
      uniqueArray.push([productItem.design, productItem.prefix]);
    }
  });
  // let's make the uniqueArray unique
  // uniqueArray = removeDuplicates(uniqueArray);
  // uniqueArray = [...new Set(uniqueArray)]
  // uniqueArray = uniqueArray.filter((value, index, self) => self.indexOf(value) === index);
  uniqueArray = uniqueArray.reduce((accumulator, currentValue) => {
    if (!accumulator.includes(currentValue)) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);

  // console.log(uniqueArray);
  // now let's state them as the parents
  uniqueArray.forEach((productItem, index) => {
    // now rewrite the data in them.
    uniqueArray[index] = {
      // title: item,
      design: productItem[0],
      prefix: productItem[1],
      date: designDate(productItem[0]),
      files: [],
      // belos things are unneccessary
      // width: 300,
      // category: "embroidered_sheer_curtain_fabrics",
    };
  });
  return uniqueArray;
};

let objectAppend = (products, uniqueDesignObject) => {
  products.forEach((item, index) => {
    uniqueDesignObject.forEach((item2, index2) => {
      if (item.design === item2.design && item.prefix === item2.prefix) {
        item2.files.push(item);
      }
    });
  });
};

let writeJSON = (arrayOfObjectData) => {
  fs.writeFile(
    "./products_embroidered_sheer_curtain_fabrics.json",
    // JSON.stringify(arrayOfObjectData, null, 4),
    JSON.stringify(arrayOfObjectData, null, 4),
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("File has been created");
    }
  );
};

let writeCSV = (arrayOfObjectData) => {
  //   // const csvData = Papa.unparse(arrayOfObjectData);
  //   // const filePath = "./products_embroidered_sheer_curtain_fabrics.csv";
  //   // fs.writeFileSync(filePath, csvData);
  //   // console.log(`CSV file saved at: ${filePath}`);
  const header = ["prefix", "design", "files"];

  const dataArrays = [];

  arrayOfObjectData.map((item) => {
    dataArrays.push([item.prefix, item.design, JSON.stringify(item.files)]);
  });
  const csvFromArrayOfArrays = convertArrayToCSV(dataArrays, {
    header,
    seperator: ",",
  });

  fs.writeFile(
    "./products_embroidered_sheer_curtain_fabrics.csv",
    csvFromArrayOfArrays,
    (err) => {
      if (err) {
        console.log(err);
      }
      console.log("csv file saved");
    }
  );
};

let writeDB = (uniqueArray) => {
  uniqueArray.map(async (item, index) => {
    await prisma.products.upsert({
      where: { name: item.design },
      update: { files: item.files },
      create: { name: item.design, files: item.files },
    });
  });
};

// let custom_sort = (a,b)=>{
//   return new Date(a.date).getTime() - new Date(b.date).getTime();
// }

// main function that runs
let node = async () => {
  const testFolder = "../../public/media/products/embroidered_sheer_curtain_fabrics";
  // first read all the file names inside the testfolder
  let productFiles = fs.readdirSync(testFolder).map((fileName, index) => {
    return fileName;
  });
  let products = classifyEachFile(productFiles);
  // console.table(products);
  let uniqueArray = uniqueDesignsObject(products);
  // console.table(uniqueArray);
  uniqueArray = removeDuplicates(uniqueArray);
  // console.table(uniqueArray);
  objectAppend(products, uniqueArray);
  console.table(uniqueArray);
  // now let's sort based on the recent date coming first
  // below is not that great soln but still works
  // uniqueArray.sort(function(a,b){return a.date.localeCompare(b.date)}).reverse()
  // this is a better solution because it does not change the original order, just rearranges the new dates on top
  uniqueArray.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  // console.log(uniqueArray[4]);
  writeJSON(uniqueArray);
  writeCSV(uniqueArray);
  // writeDB(uniqueArray)
};

node();
module.exports.uniqueArray = uniqueArray;
module.exports.node = node;
// below is for creating a file of json with your data
