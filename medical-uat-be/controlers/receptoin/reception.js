const pool = require("../../dbConfig/config");


const  getPatientsByReceptionId = async (req, res) => {
    try {
        const receptionId = req.receptionId
        await pool.connect(); // connect to the database
        const query = 'SELECT * FROM patients WHERE createdReceptionId = $1';
        const values = [receptionId];
        console.log(values,"........values")
        const resdb = await pool.query(query, values);
        console.log(resdb.rows); // log the result rows
        const patientsData = resdb.rows
        await pool.end(); // close the database connection
        return res.status(200).json({msg: patientsData.length ? "":"Please Add Patients", code: 200, data:patientsData})
    } catch (err) {
        console.error('Error executing query', err.stack);
        return res.status(200).json({msg: "Internal Server Error", code : 500})
    } 
}

const  getReceptionProfileData = async (req, res) => {
    try {
        const receptionId = req.userId
        await pool.connect(); // connect to the database
        const query = 'SELECT name, email FROM users WHERE id = $1';
        const values = [receptionId];
        console.log(values,"........values")
        const resdb = await pool.query(query, values);
        console.log( resdb.rows); // log the result rows
        const reception =  resdb.rows
        if(reception.length){
            return res.status(200).json({msg: "", code: 200, data:reception[0]})
        }
        return res.status(200).json({msg: "Receptions Not Found", code: 400, })
    } catch (err) {
        console.error('Error executing query', err.stack);
        return res.status(200).json({msg: "Internal Server Error", code : 500})
    } 
}

const addPatient = async (req, res) =>{
    try {
        const {name, age, condition, phone, address, dob, emergency_contact, blood_group,} = req.body
        if(!name || !age || !condition || !phone || !address || !dob || !emergency_contact || !blood_group ){
            return res.status(200).json({msg:"Bad Request", code : 400})
        }
        const receptionId = req.userId
        await pool.connect();

        const insertPatientQuery = `
            INSERT INTO patients (name, age, condition, phone, address, dob, emergency_contact, blood_group, createdReceptionId)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *; -- Optional: Returns the newly inserted patient record
        `;

        const values = [
           name,
           +age, condition, +phone, address, dob, emergency_contact, blood_group, receptionId
        ];

        const resdb = await pool.query(insertPatientQuery, values);
        console.log("Patient added successfully:", resdb.rows[0]); 
        
        if(resdb.rows[0]){
            console.log("enterrrrr")
            return res.status(200).json({msg:"Patient added successfully", code : 200})
        }else{
            return res.status(200).json({msg:"Failed to add Patient", code : 400})
        }
    } catch (err) {
        console.log(err)
       return res.status(200).json({msg:"Internal Server Error", code :500})
    } 
}

const updatePatient = async (req, res) => {
    try {
        const client =   await pool.connect();
      
        const {patientId,name,
            age,
            condition,
            phone,
            address,
            dob,
            emergency_contact,
            blood_group,receptionId} = req.body
        if(!patientId || !name ||
            !age||
            !condition||
            !phone||
            !address||
            !dob||
            !emergency_contact||
            !blood_group||!receptionId){
                return res.status(200).json({msg:"Bad Request", code : 400})
            }
        // Step 1: Check if the patient exists
        const checkPatientQuery = 'SELECT * FROM patients WHERE id = $1';
        const checkPatientValues = [patientId];
        const checkPatientRes = await client.query(checkPatientQuery, checkPatientValues);

        if (checkPatientRes.rows.length === 0) {
            console.log("Patient not found.");
            return res.status(200).json({msg:"Patient Not Found!", code : 400})
        }

        // Step 2: Check if the createdReceptionId exists in the receptions table
        const checkReceptionQuery = 'SELECT * FROM patients WHERE id = $1 AND createdReceptionId = $2';
        const checkReceptionValues = [patientId,receptionId];
        const checkReceptionRes = await client.query(checkReceptionQuery, checkReceptionValues);

        if (checkReceptionRes.rows.length === 0) {
            console.log("You are not created this patient");
            return res.status(200).json({msg:"You are not created this patient", code : 400}) 
        }

        // Step 3: Proceed to update the patient
        const updatePatientQuery = `
            UPDATE patients
            SET name = $1,
                age = $2,
                condition = $3,
                phone = $4,
                address = $5,
                dob = $6,
                emergency_contact = $7,
                blood_group = $8,
            WHERE id = $9
            RETURNING *; -- Optional: Returns the updated patient record
        `;

        const values = [
            name,
            age,
            condition,
            phone,
            address,
            dob,
            emergency_contact,
            blood_group,                    
            patientId                     
        ];

        const updateRes = await client.query(updatePatientQuery, values);
        console.log("Patient updated successfully:", updateRes.rows[0]); 
        await client.end()
        if(updateRes.rows[0]){
            return res.status(200).json({msg : "Patient updated successfully", code :200, data : updateRes.rows[0]})

        }else{
            return res.status(200).json({msg : "Patient updated failed!", code :400})
        }
    } catch (err) {
        console.log(err)
        return res.status(200).json({msg:"Internal Server Error!", code : 500})
    } 
}

module.exports = {getPatientsByReceptionId, addPatient,getReceptionProfileData,updatePatient}
