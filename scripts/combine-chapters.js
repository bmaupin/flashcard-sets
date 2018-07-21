const fs = require('fs');
const inquirer = require('inquirer');
const parse = require('csv-parse/lib/sync');
const readline = require('readline');
const stringify = require('csv-stringify/lib/sync');

const OUTPUT_FILENAME = 'all.csv';
const INPUT_LANGUAGE_ARABIC = 'Arabic';
const INPUT_LANGUAGE_ENGLISH = 'English';
const INPUT_LANGUAGES = [
  INPUT_LANGUAGE_ENGLISH,
  INPUT_LANGUAGE_ARABIC,
]
const REGEX_TO_SPLIT_WORDS = /[\s,/()?!:;'".؟؛،]+/

async function main() {
  let inputFiles = getInputFiles();

  let inputLanguages = await getInputLanguages(inputFiles);

  let outputRecords = await parseInputFiles(inputFiles, inputLanguages);

  let output = stringify(outputRecords);
  fs.writeFileSync(OUTPUT_FILENAME, output);
}

function getInputFiles() {
  let inputFiles = [];

  for (let i = 0; i < process.argv.length; i++) {
    let inputParameter = process.argv[i];

    if (inputParameter === OUTPUT_FILENAME) {
      console.log(`WARNING: not including output CSV file: ${OUTPUT_FILENAME}`);
      continue;
    } else if (inputParameter.endsWith('.csv')) {
      inputFiles.push(inputParameter);
    }
  }

  if (inputFiles.length === 0) {
    printUsage();
    process.exit();
  }

  inputFiles.sort();

  return inputFiles;
}

function printUsage() {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} file1.csv file2.csv ...`);
}

async function getInputLanguages(inputFiles) {
  let inputRecords = parseInputFile(inputFiles[0]);

  let inputLanguage1 = await getInputLanguage(inputRecords[0][0]);
  let inputLanguage2 = await getInputLanguage(inputRecords[0][1]);

  return [inputLanguage1, inputLanguage2];
}

function getInputLanguage(field) {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'inputLanguage',
          message: `What language is this field?: ${field}`,
          choices: INPUT_LANGUAGES,
        },
      ])
      .then(answers => {
        resolve(answers.inputLanguage);
      }
    );
  });
}

async function parseInputFiles(inputFiles, inputLanguages) {
  let outputRecords = [];

  for (let i = 0; i < inputFiles.length; i++) {
    let inputRecords = parseInputFile(inputFiles[i]);

    outputRecords = await mergeRecords(inputRecords, outputRecords, inputLanguages);
  }

  return outputRecords;
}

function parseInputFile(inputFile) {
  let inputRecords = parse(fs.readFileSync(inputFile));
  inputRecords = addFilenameAsTag(inputFile, inputRecords);

  return inputRecords;
}

function addFilenameAsTag(inputFile, inputRecords) {
  for (let i = 0; i < inputRecords.length; i++) {
    let inputRecord = inputRecords[i];

    if (inputRecord.length === 2) {
      inputRecords[i][2] = formatFilenameAsTag(inputFile);
    } else {
      inputRecords[i][2] += ` ${formatFilenameAsTag(inputFile)}`;
    }
  }

  return inputRecords;
}

function formatFilenameAsTag(filename) {
  let tag = filename.toLowerCase();
  tag = removeCsvExtension(tag);
  tag = capitalizeFirstLetter(tag);
  // Anki will replace underscores with spaces
  tag = tag.replace('Unit', 'Unit_');
  tag = tag.replace('Chapter', 'Chapter_');

  return tag;
}

function removeCsvExtension(filename) {
  if (filename.endsWith('.csv')) {
    return filename.slice(0, -4);
  }
}

// https://stackoverflow.com/a/1026087/399105
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function mergeRecords(inputRecords, outputRecords, inputLanguages) {
  for (let i = 0; i < inputRecords.length; i++) {
    let inputRecord = inputRecords[i];
    let isDuplicate = false;

    if (outputRecords.length === 0) {
      outputRecords.push(inputRecord);
      continue;
    }

    for (let j = 0; j < outputRecords.length; j++) {
      let outputRecord = outputRecords[j];

      isDuplicate = await isDuplicateRecord(inputRecord, outputRecord, inputLanguages, 0);

      if (isDuplicate === false) {
        isDuplicate = await isDuplicateRecord(inputRecord, outputRecord, inputLanguages, 1);
      }

      if (isDuplicate === true) {
        outputRecord = await mergeDuplicateRecords(inputRecord, outputRecords, j, inputLanguages);
        break;
      }
    }

    if (isDuplicate === false) {
      outputRecords.push(inputRecord);
    }
  }

  return outputRecords;
}

async function isDuplicateRecord(record1, record2, recordLanguages, fieldIndexToCompare) {
  if (record1 === record2 || record1[0] === record2[0] || record1[1] === record2[1]) {
    return await askUserIfDuplicate(record1, record2, recordLanguages);
  }

  switch (recordLanguages[fieldIndexToCompare]) {
    case INPUT_LANGUAGE_ARABIC:
    return await isDuplicateArabicRecord(record1, record2, fieldIndexToCompare, recordLanguages);
    case INPUT_LANGUAGE_ENGLISH:
      return await isDuplicateEnglishRecord(record1, record2, fieldIndexToCompare, recordLanguages);
  }
}

async function isDuplicateArabicRecord(record1, record2, fieldIndexToCompare, recordLanguages) {
  const field1 = record1[fieldIndexToCompare];
  const field2 = record2[fieldIndexToCompare];

  let field1WithoutPunctuation = removePunctuation(field1);
  let field2WithoutPunctuation = removePunctuation(field2);

  if (removeArabicDiacritics(field1WithoutPunctuation) === removeArabicDiacritics(field2WithoutPunctuation)) {
    return await askUserIfDuplicate(record1, record2, recordLanguages);
  }

  return false;
}

function removeArabicDiacritics(arabicString) {
  arabicString = arabicString.replace(/َ/g, '');
  arabicString = arabicString.replace(/ً/g, '');
  arabicString = arabicString.replace(/ِ/g, '');
  arabicString = arabicString.replace(/ٍ/g, '');
  arabicString = arabicString.replace(/ُ/g, '');
  arabicString = arabicString.replace(/ٌ/g, '');
  arabicString = arabicString.replace(/ْ/g, '');

  arabicString = arabicString.replace(/أ/g, 'ا');
  arabicString = arabicString.replace(/إ/g, 'ا');
  arabicString = arabicString.replace(/آ/g, 'ا');
  arabicString = arabicString.replace(/ؤ/g, 'و');
  arabicString = arabicString.replace(/ئ/g, 'ى');

  return arabicString;
}

async function isDuplicateEnglishRecord(record1, record2, fieldIndexToCompare, recordLanguages) {
  const field1 = record1[fieldIndexToCompare];
  const field2 = record2[fieldIndexToCompare];

  let field1WithoutPunctuation = removePunctuation(field1);
  let field2WithoutPunctuation = removePunctuation(field2);

  if (field1WithoutPunctuation === field2WithoutPunctuation) {
    return await askUserIfDuplicate(record1, record2, recordLanguages);
  }

  return false;
}

function removePunctuation(str) {
  let words = str.split(REGEX_TO_SPLIT_WORDS);
  return words.join(' ');
}

function askUserIfDuplicate(record1, record2, recordLanguages) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let record1Copy = record1.slice();
    let record2Copy = record2.slice();
    let arabicFieldIndex = recordLanguages.indexOf(INPUT_LANGUAGE_ARABIC);

    if (arabicFieldIndex !== -1) {
      record1Copy[arabicFieldIndex] = reverseString(record1Copy[arabicFieldIndex]);
      record2Copy[arabicFieldIndex] = reverseString(record2Copy[arabicFieldIndex]);
    }

    rl.question(`\nRecord 1: ${record1Copy}\nRecord 2: ${record2Copy}\nIs this a duplicate (y/n)? `, async (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'y') {
        resolve(true);
      } else if (answer.toLowerCase() === 'n') {
        resolve(false);
      } else {
        resolve(await askUserIfDuplicate(record1, record2, recordLanguages));
      }
    });
  });
}

async function mergeDuplicateRecords(inputRecord, outputRecords, outputDuplicateIndex, recordLanguages) {
  let recordToKeep = await chooseRecordToKeep(outputRecords[outputDuplicateIndex], inputRecord, recordLanguages);

  outputRecords[outputDuplicateIndex] = [
    recordToKeep[0],
    recordToKeep[1],
    `${outputRecords[outputDuplicateIndex][2]} ${inputRecord[2]}`
  ];

  return outputRecords;
}

function chooseRecordToKeep(record1, record2, recordLanguages) {
  let record1DisplayCopy = record1.slice();
  let record2DisplayCopy = record2.slice();

  let arabicFieldIndex = recordLanguages.indexOf(INPUT_LANGUAGE_ARABIC);

  if (arabicFieldIndex !== -1) {
    record1DisplayCopy[arabicFieldIndex] = reverseString(record1DisplayCopy[arabicFieldIndex]);
    record2DisplayCopy[arabicFieldIndex] = reverseString(record2DisplayCopy[arabicFieldIndex]);
  }

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'recordToKeep',
          message: 'Which record would you like to keep (the other will be merged)?',
          choices: [
            {
              name: record1DisplayCopy.toString(),
              value: record1,
            },
            {
              name: record2.toString(),
              value: record2DisplayCopy,
            }
          ]
        },
      ])
      .then(answers => {
        resolve(answers.recordToKeep);
      }
    );
  });
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

main();

// Get more detailed logging of errors thrown from Promises
// https://stackoverflow.com/a/43994999/399105
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
