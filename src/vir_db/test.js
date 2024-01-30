const uniqueArray = require("./products_embroidered_sheer_curtain_fabrics.json");
const fs = require("fs");

// const uniqueArray = require()
// const jsFile = require("./classify_embroidered_sheer_curtain_fabrics");

// // console.log(jsFile.uniqueArray);
// // console.log(jsFile.node)

// console.table(uniqueArray);

// const hasValue = Object.values(uniqueArray).includes('12011')
// console.log(hasValue);

let hasMatch = false;

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

for (let index = 0; index < uniqueArray.length; ++index) {
  let product = uniqueArray[index];
  // if(product.design==='12132'){
  //     hasMatch = true;
  //     break;
  // }
  product.date = "2024-01-19";
  uniqueArray[index].date = product.date;
}
writeJSON(uniqueArray);
