import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const uri = 'mongodb://nametbd:passtbd@localhost:27017/?authSource=SDC&authMechanism=SCRAM-SHA-256';
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const db = client.db('SDC');

        const dataDir = path.join(__dirname, '../data');
        const files = fs.readdirSync(dataDir);
        for (const file of files) {
            const collection = file.split('.')[0];
            const json = fs.readFileSync(path.join(dataDir, file), 'utf8');
            const data = JSON.parse(json);
	    for (const i of data){
	    	if (i.hasOwnProperty('CreateTime')){
			i.CreateTime = new Date(Date.now());
	    	}
	    }
            console.log(`Doing ${collection} collection...`);
            console.log(`  - Clearing ${collection} collection...`);
            const result = await db.collection(collection).deleteMany({});
            console.log(`  - Cleared ${result.deletedCount} document(s) from ${collection}`);

            console.log(`  - Inserting into ${collection}`);
            const formsInsertResult = await db.collection(collection).insertMany(data);
            console.log(`  - Inserted ${formsInsertResult.insertedCount} document(s)`);
            console.log(`${collection} done\n`);
        }
    } catch (e) {
        console.log('Error inserting data:')
        console.log(e);
    } finally {
        await client.close();
    }
}

run();
