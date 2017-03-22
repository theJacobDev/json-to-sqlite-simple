let sqlite3 = require('sqlite3').verbose();
let fs = require('fs');
let inquirer = require('inquirer');

// Ask user for data interactively

let promptSchema = [
  {
    name: 'json',
    type: 'input',
    default: 'data.json',
    message: 'What is your json file name?'
  },
  {
    name: 'database',
    type: 'input',
    default: 'database.db',
    message: 'How do you want to name your database?'
  },
  {
    name: 'tableName',
    type: 'input',
    default: 'data',
    message: 'How do you want to name your table?'
  },
  {
    name: 'jsonType',
    type: 'list',
    message: 'What is your json type?',
    choices: [{
      value: 'Array',
      name: 'array of objects'
    },
    {
      value: 'Object',
      name: 'objects with keys (keys will be stored as "key" in table)'
    }]
  }
]

inquirer.prompt(promptSchema).then((answers) => {
  createTable(answers)
})

function createTable(data) {
  let keys;
  let json = JSON.parse(fs.readFileSync('./' + data.json, 'utf8'));
  let db = new sqlite3.Database('./' + data.database);

  if (data.jsonType === 'Array') {
    keys = getKeysBasic(json[0]);
  } else {
    keys = getKeysFromObjectJson(json);
  }

  db.serialize( () => {
    db.run(createTableScheme(keys, data.tableName));

    db.run('delete from ' + data.tableName);

    let insertJson = db.prepare(createPrepareScheme(keys, data.tableName));

    if (data.jsonType === 'Array') {
      for (const object of json) {
        let insert = [];
        for (const key of Object.keys(object)) {
          insert.push(object[key]);
        }
        insertJson.run(insert);
      }
    } else {
      for (const key of Object.keys(json)) {
          let insert = [];
          for (const key2 of Object.keys(json[key])) {
            insert.push(json[key][key2])
          }
          insert.push(key);
          insertJson.run(insert);
      }
    }

    insertJson.finalize();
  })
}

getKeysBasic = (object) => {
  let keys = [];

  for (const key of Object.keys(object)) {
    let type = (typeof object[key] === 'string' ? 'text' : 'numeric');
    keys.push({name: key, type: type});
  };

  return keys;
}

getKeysFromObjectJson = (json) => {
  let keys = getKeysBasic(json[Object.keys(json)[0]]);
  keys.push({name: 'key', type: 'text'});
  return keys;
}

createTableScheme = (keys, name) => {
  let keysSQL = '(';

  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      keysSQL = keysSQL + keys[i].name + ' ' + keys[i].type + ')';
    } else {
      keysSQL = keysSQL + keys[i].name + ' ' + keys[i].type + ', ';
    }
  }

  return 'create table if not exists ' + name + ' ' + keysSQL;
}

// Create SQL .prepare for inserting data into database

createPrepareScheme = (keys, tableName) => {
  let prepareSQL = 'insert into ' + tableName + ' values (';

  for(let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      prepareSQL = prepareSQL + '?)';
    }
    else {
      prepareSQL = prepareSQL + '?,';
    }
  }

  return prepareSQL;
}
