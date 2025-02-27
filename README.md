# Test_Automation_Pipeline
Test Automation Pipeline for Meta Llama 3.2 Vision Models for Invoices

How to use : 
1. Open the folder in terminal and enter npm init
2. Open the folder in terminal and type 'node server.js'
3. Now ensure that you have copied the test invoice images in the public/images folder
4. Now enter the image name and select the extension using the dropdown list
5. Click on show preview if you want to confirm the correct invoice image is selected
6. Now click on submit
7. The Review page appears, here you have a form which contains the extracted information.
8. You can edit this information using the form
9. Now, click on 'submit entry'
10. This will save the entry in a csv file

The public folder contains: 
1. invoice_ds.csv (Contains the final invoice entries once the user corrects)
2. invoice_items_ds.csv (Contains the final item entries)
3. meta_test_invoice_ds.csv (Contains the raw entries provided by the LLM)
4. meta_test_items_invoice_ds.csv (Contains the raw item entries provided by the LLM)
5. Images folder: Enter your invoices here (Note that you dont have to write the extnsions here, the UI asks you to select the correct extension for the images)

Regarding API:
Create a .env file and store the TOGETHER_API_KEY
You can obtain this key using the together.ai website
