import { expect } from 'chai';
import { HanaClient } from '../';
import { connectionOption } from './config';

describe('Test Library ', () => {
    const sql = 'select * FROM DUMMY;';

    before(async () => {
        //
    });

    beforeEach(async () => {
        //
    });

    afterEach(async () => {
        //
    });

    after(async () => {
        //
    });

    it('Test create address funtion has proper field', async () => {
        let result;
        try {
            const client = new HanaClient(connectionOption);
            await client.createConnection();
            result = await client.exec(sql);
            await client.disconnect();
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }

        console.log(result);
    });
});
