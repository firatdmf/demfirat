// I am importing the fs module from the builtin node. FS enables me to read and write files within the system
const fs = require("fs");
// import { Prisma, PrismaClient } from '@prisma/client'
const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()
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

// Below function determines if a character is a letter or not.
let isLetter = (str) => {
  return str.length === 1 && str.match(/[a-z]/i);
};

let classifyImage = (fileName, products) => {
  // lets create an empty object
  let object = {};
  // annex stands for T or I, for tasli and incili respectively
  let annex;
  // takeout the file extension from the name of the file and store it in the design variable. This will be altered later on the code
  let design = fileName.split(".")[0];

  // Initializing the variable imageNo
  let imageNo;
  // If the file name icludes - character, it means it has multiple images of this design and variant. So let's take the order number of that design+variant and assign to imageNo variable
  if (fileName.includes("-")) {
    // imageNo.push(design.split("-")[1]);
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
  // Now lets determine if it's a letter or not. If it is not a letter, and the character comes right after it is a letter, then it has a variant.
  if (!isLetter(secondLastCharacter) && isLetter(design.slice(-1))) {
    // Take out the last character and store it in the variable called annex
    annex = design.slice(-1);
    // Let's once again filter out the extra strings from the design variable
    design = fileName.split(annex)[0];
  } else {
    annex = "";
  }

  // Now at below, we determine if we already have this design in the folder/data
  // If there is, then we store their indexes from the products json file
  const i = products.findIndex((e) => e.design === design);
  // lets initialize a boolean variable and set it equal to false
  let exists = false;
  if (i > -1) {
    exists = true;
  }
  // else {
  object.name = fileName;
  object.design = design;
  object.annex = annex;
  object.variant = variant;
  object.imageNo = imageNo;
  // return console.log(string);
  // }
  //   console.log(JSON.stringify(object) + " / " + exists);
  return [object, exists];
};

//TRYING OUT FIRST
let classifyEachFile = (productFiles) => {
  let products = [];
  productFiles.map((item, index) => {
    let [object, exists] = classifyImage(item, products);
    products.push(object);
  });
  // console.table(products);
  return products;
};

let removeDuplicates = (array) => {
  return array.filter((item, index) => array.indexOf(item) == index);
};
let getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

let uniqueDesignsObject = (products) => {
  let uniqueArray = [];
  products.map((item) => {
    uniqueArray.push(item.design);
  });
  uniqueArray = removeDuplicates(uniqueArray);
  uniqueArray.forEach((item, index) => {
    if (item>8000){
      prefix = 'K'
    }else{
      prefix = 'N'
    }
    uniqueArray[index] = {
      // title: item,
      prefix,
      design: item,
      files: [],
      width: 300,
      category: "embroidered_sheer_curtain_fabrics",
    };
  });
  // console.table(uniqueArray);
  return uniqueArray;
};

let objectAppend = (products, uniqueDesignObject) => {
  products.forEach((item, index) => {
    uniqueDesignObject.forEach((item2, index2) => {
      if (item.design === item2.design) {
        item2.files.push(item);
      }
    });
  });
};

let writeJSON = (arrayOfObjectData) => {
  fs.writeFile(
    "./products_embroidered_sheer_curtain_fabrics.json",
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

// main function that runs
let node = async () => {
  const testFolder = "../../public/products/embroidered_sheer_curtain_fabrics";
  // first read all the file names inside the testfolder
  let productFiles = fs.readdirSync(testFolder).map((fileName, index) => {
    return fileName;
  });
  let products = classifyEachFile(productFiles);
  console.table(products);
  let uniqueArray = uniqueDesignsObject(products);
  console.table(uniqueArray);
  objectAppend(products, uniqueArray);
  console.table(uniqueArray);
  console.log(uniqueArray[4]);
  writeJSON(uniqueArray);
  const embroidered_sheer_curtain_fabrics = await prisma.collections.upsert({
    where:{id:1},
    update:{},
    create:{
      data:uniqueArray,
      collection:'products_embroidered_sheer_curtain_fabrics'
    }
  })
};

node();

// below is for creating a file of json with your data
