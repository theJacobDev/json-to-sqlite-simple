# Simple JSON to SQLITE converter
Transforms your json into sqlite database.

## Usage

Get the code

```
git clone https://github.com/JakubDev/json-to-sqlite-simple
```

Install dependencies
```
npm install
```

Copy your json to the project folder and run the script
```
npm start
```

## Support

Right now it supports 2 types of json with simple structure
* Array of objects

```
[
  {
    "name": "Kuba",
    "city": "NY"
  },
  {
    "name": "Michal",
    "city": "LA"
  }
]

```
* Object with keys

```
{
  "first": {
    "name": "Kuba",
    "city": "NY"
  },
  "second": {
    "name": "Michal",
    "city": "LA"
  }
}
```
