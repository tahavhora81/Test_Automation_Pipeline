require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Together = require('together-ai');

const fs =require('fs');

const app =express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const client = new Together({
    apiKey: process.env['TOGETHER_API_KEY'] // The API key is not provided in .env file for security reasons
});

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

var prompt = "For the provided invoice return the following attributes in a json. Only provide the JSON and no other text. Directly start with the JSON. The attributes and their names in the JSON are as follows: Invoice number: inv_no , Invoice date: inv_date, Customer name (bill to): cust_name, billing address: bill_address, , total (final total) : total, tax (amount, not percentage, can be GST, VAT, IGST, CGST, SGST) : tax (if not mentioned then 0), Due date: due_date, items List with name 'items' containing item name: item_name, quantity : qty, unit price: unit_price, quantity : qty . If anything is not available then write 'NaN' in front of it. Provide dates is DD-MM-YYYY format. In invoice number only provide numbers and no text. Provide all values in quatotation marks. Do not add tax or discount as items. Close the JSON with }";

var prev;
var img_name;


app.post('/submit', async (req, res)=>{
    let image_no = req.body.image_no;
    img_name = image_no;
    let model_name = req.body.select_model;
    let img_ext = req.body.img_extension;
    let img_simple = 'images/' + image_no + img_ext;
    console.log(img_simple);
    let img_path = 'C:/Users/Admin/Desktop/Taha/IDP Phase 2 Taha/Test_Automation_Pipeline/public/images/';
    img_path = img_path + image_no + img_ext;
    const finalImageUrl = isRemoteFile(img_path)
    ? img_path
    : `data:image/jpeg;base64,${encodeImage(img_path)}`;

    const chatCompletion = await client.chat.completions.create({
        messages:[
            
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": finalImageUrl,
                        },
                    },
                ],
            }
        ],
            model : model_name,
            temperature : 0.3,
    });

    let op = await chatCompletion.choices[0].message.content;
    op = JSON.parse(op);
    prev = op;
    console.log(op);
    const csv = `${img_name},${prev.inv_no},${prev.inv_date},${prev.cust_name},"${prev.bill_address}",${prev.total},${prev.tax},${prev.due_date}\n`;
    try {
      fs.appendFileSync(path.join(__dirname, 'public', 'meta_test_invoice_ds.csv'), csv);
    } catch (err) {
      console.error(err);
    }

    for(let i=0; i<prev.items.length; i++){
        const csv = `${img_name},${i},${prev.items[i].item_name},${prev.items[i].qty},${prev.items[i].unit_price}\n`;
        try {
        fs.appendFileSync(path.join(__dirname, 'public', 'meta_test_invoice_items_ds.csv'), csv);
        } catch (err) {
        console.error(err);
        }
    }
    res.render(path.join(__dirname, 'views', 'index.ejs'), {img_prev_path : img_simple, data : op});
});


app.post('/enter', (req,res)=>{
    
    let curr ={
        inv_no : req.body.inv_no, 
        inv_date : req.body.inv_date,
        cust_name: req.body.cust_name, 
        bill_address : req.body.bill_address,
        total : req.body.total,
        tax : req.body.tax,
        due_date : req.body.due_date, 
        items: []
    }

    for(let i=0; i< req.body.item_name.length; i++){
        curr.items.push({item_name: req.body.item_name[i], qty: req.body.item_qty[i], unit_price: req.body.unit_price[i]});
    }

    const csv = `${img_name},${curr.inv_no},${curr.inv_date},${curr.cust_name},"${curr.bill_address}",${curr.total},${curr.tax},${curr.due_date}\n`;
    try {
      fs.appendFileSync(path.join(__dirname, 'public', 'invoice_ds.csv'), csv);
    } catch (err) {
      console.error(err);
    }

    for(let i=0; i<curr.items.length; i++){
        const csv = `${img_name},${i},${curr.items[i].item_name},${curr.items[i].qty},${curr.items[i].unit_price}\n`;
        try {
        fs.appendFileSync(path.join(__dirname, 'public', 'invoice_items_ds.csv'), csv);
        } catch (err) {
        console.error(err);
        }
    }
    /*
    let result ={items : []};
    let checker = true;
    if(prev.inv_no == curr.inv_no){
        result.inv_no_result = "Yes";
    }
    else{
        result.inv_no_result = "No";
        checker = false;
    }

    if(prev.inv_date == curr.inv_date){
        result.inv_date_result = "Yes";
    }
    else{
        result.inv_date_result = "No";
        checker = false;
    }

    if(prev.cust_name == curr.cust_name){
        result.cust_name_result = "Yes";
    }
    else{
        resultcust_name_result = "No";
        checker = false;
    }

    if(prev.bill_address == curr.bill_address){
        result.bill_address_result = "Yes";
    }
    else{
        result.bill_address_result = "No";
        checker = false;
    }

    if(prev.total == curr.total){
        result.total_result = "Yes";
    }
    else{
        result.total_result = "No";
        checker = false;
    }

    if(prev.tax == curr.tax){
        result.tax_result = "Yes";
    }
    else{
        result.tax_result = "No";
        checker = false;
    }

    if(checker){
        result.overall = "Yes";
    }   
    else{
        result.overall = "No";
    } */

    
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000.");
});


function encodeImage(imagePath) {
    const imageFile = fs.readFileSync(imagePath);
    return Buffer.from(imageFile).toString("base64");
}
  
function isRemoteFile(filePath)  {
    return filePath.startsWith("http://") || filePath.startsWith("https://");
}