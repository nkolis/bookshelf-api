const {nanoid} = require('nanoid');
const books = require('./books');

const addBookHandler = (req, h) => {
  try {
    const {name, year, author, summary, publisher, pageCount,
      readPage, reading} = req.payload;

    const id = nanoid(16);
    const finished = (pageCount === readPage);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {name, year, author, summary, publisher, pageCount,
      readPage, reading, id, finished, insertedAt, updatedAt};

    if (newBook.name === undefined) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      }).code(400);
    }
    if (readPage>pageCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
    }

    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
      return h.response({
        'status': 'success',
        'message': 'Buku berhasil ditambahkan',
        'data': {
          'bookId': id,
        },
      }).code(201);
    }
  } catch {
    return h.response({
      'status': 'error',
      'message': 'Buku gagal ditambahkan',
    }).code(500);
  }
};

const getAllBooksHandler = (req, h) => {
  const {name, reading, finished} = req.query;

  let result = books;
  if (name!==undefined) {
    result = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (reading!==undefined) {
    if (reading=='0') {
      result = books.filter((book) => book.reading === false);
    } else if (reading=='1') {
      result = books.filter((book) => book.reading === true);
    }
  }
  if (finished!==undefined) {
    if (finished=='0') {
      result = books.filter((book) => book.finished === false);
    } else if (finished=='1') {
      result = books.filter((book) => book.finished === true);
    }
  }

  return {'status': 'success',
    'data': {
      'books': result.map((book) => ({id: book.id, name: book.name, publisher: book.publisher})),
    },
  };
};

const getBookByIdHandler = (req, h) => {
  const {id} = req.params;

  const book = books.find((book) => book.id === id);

  if (book !== undefined) {
    return {
      'status': 'success',
      'data': {
        'book': book,
      },
    };
  }

  return h.response({
    'status': 'fail',
    'message': 'Buku tidak ditemukan',
  }).code(404);
};

const editBookByIdHandler = (req, h) => {
  const {id} = req.params;
  const payload = req.payload;
  if (payload===null) {
    return h.response({
      'status': 'error',
      'message': 'Buku gagal diperbarui',
    }).code(500);
  }
  const book = books.find((book) => book.id === id);
  if (book===undefined) {
    return h.response({
      'status': 'fail',
      'message': 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  const {name, year, author, summary, publisher, pageCount,
    readPage, reading} = payload;

  const finished = (pageCount === readPage);
  const updatedAt = new Date().toISOString();

  const newBook = {name, year, author, summary, publisher, pageCount,
    readPage, reading, finished, updatedAt};

  if (newBook.name === undefined) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }
  if (readPage>pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  for (const index in books) {
    if (books[index].id === id) {
      books[index] = {
        ...books[index],
        ...newBook,
      };
      return h.response({
        'status': 'success',
        'message': 'Buku berhasil diperbarui',
      });
    }
  }
};

const deleteBookByIdHandler = (req, h) => {
  const {id} = req.params;
  const index = books.findIndex((book) => book.id === id);

  if (index!=-1) {
    books.splice(index, 1);
    return h.response({
      'status': 'success',
      'message': 'Buku berhasil dihapus',
    });
  }
  return h.response({
    'status': 'fail',
    'message': 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

module.exports = {addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler};
