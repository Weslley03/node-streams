const { pipeline, Readable, Writable, Transform } = require('stream');
const { createWriteStream } = require('fs');
const { promisify } = require('util');

const readableStream = Readable({
  read () {
    for ( let i =0 ; i < 1e4 ; i++ ) {
      const databaseData = { id: Date.now() + i, name: `Weslley - ${i}` }; //simulando dados de um banco..
      const chunk = JSON.stringify(databaseData);
      this.push(chunk);
    };
    this.push(null);
  }
});

const transformStream = Transform({
  transform (chunk, encoding, cb) {
    const data = JSON.parse(chunk);
    const result = `${data.id} - ${data.name.toUpperCase()}\n`;
    cb(null, result);
  } 
});

const fileWritableStream = createWriteStream('database.txt');

const consoleWritableStream = Writable({
  write (chunk, encoding, cb) {
    process.stdout.write(chunk);
    fileWritableStream.write(chunk)
    cb();
  }
});

//usar o PIPELINE melhora legibilidade e captursa de possiveis erros com o 'try/catch'.
const pipelineAsync = promisify(pipeline);

async function run() {
  try{
    await pipelineAsync(
      readableStream,
      transformStream,
      consoleWritableStream, 
    );
    console.log('pipeline finalizado com sucesso!');
  }catch(err){
    console.error(`error run, ${err}`);
  } finally {
    fileWritableStream.end();
  }
};

run();
