import fs from 'fs';
import fsPromise from 'fs/promises';

//Mapping level number to array of codes available
type Codes = {
  [level: string]: string[];
};

//Mapping user to level and corresponding code
type Users = {
  [userId: string]: {
    [level: string]: string;
  };
};

export default class StorageHelper {
  private static instance: StorageHelper;

  private constructor() {
    fs.access('./src/codes.json', fs.constants.R_OK, (err) => {
      if (!err) return;
      const codes: Codes = {};
      fs.writeFile('./src/codes.json', JSON.stringify(codes), (err) => {
        if (!err) return;
        console.log(err);
        throw Error('Impossible to open nor create codes.json.');
      });
    });

    fs.access('./src/users.json', fs.constants.R_OK, (err) => {
      if (!err) return;
      const codes: Users = {};
      fs.writeFile('./src/users.json', JSON.stringify(codes), (err) => {
        if (!err) return;
        console.log(err);
        throw Error('Impossible to open nor create users.json.');
      });
    });
  }

  public static getInstance(): StorageHelper {
    if (StorageHelper.instance === undefined) {
      StorageHelper.instance = new StorageHelper();
    }
    return StorageHelper.instance;
  }

  public async readCodes(): Promise<Codes> {
    const content = await fsPromise.readFile('./src/codes.json', 'utf-8');
    return JSON.parse(content);
  }

  public async readUsers(): Promise<Users> {
    const content = await fsPromise.readFile('./src/users.json', 'utf-8');
    return JSON.parse(content);
  }

  public async writeCodes(content: Codes): Promise<void> {
    await fsPromise.writeFile('./src/codes.json', JSON.stringify(content));
  }

  public async writeUsers(content: Users): Promise<void> {
    await fsPromise.writeFile('./src/users.json', JSON.stringify(content));
  }
}
