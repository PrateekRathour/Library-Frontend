import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  BookmarkPlus,
  Layers,
  LayoutGrid,
  List,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const BooksPage = () => {
  const { canManageBooks } = useAuth();
  const { showToast } = useToast();

  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Active book for action
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    genre: '',
    totalCopies: 1,
    availableCopies: 1,
    shelfLocation: '',
    coverImageUrl: '',
    description: '',
  });

  // Quick Issue state
  const [members, setMembers] = useState([]);
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueDays, setIssueDays] = useState(14);
  const [issueRemarks, setIssueRemarks] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/books', {
        params: {
          query: searchQuery,
          genre: selectedGenre,
          status: selectedStatus,
        },
      });
      if (res.data && res.data.data) {
        setBooks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      showToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await api.get('/books/genres');
      if (res.data && res.data.data) {
        setGenres(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchMembers = async () => {
    if (!canManageBooks) return;
    try {
      const res = await api.get('/members');
      if (res.data && res.data.data) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedGenre, selectedStatus]);

  useEffect(() => {
    fetchGenres();
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      genre: genres[0] || 'Computer Science',
      totalCopies: 3,
      availableCopies: 3,
      shelfLocation: 'Section CS-01',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || new Date().getFullYear(),
      genre: book.genre,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || '',
      coverImageUrl: book.coverImageUrl || '',
      description: book.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenIssueModal = (book) => {
    setSelectedBook(book);
    setIssueMemberId(members[0]?.id || '');
    setIssueDays(14);
    setIssueRemarks('');
    setIsIssueModalOpen(true);
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/books', formData);
      showToast(`Book "${formData.title}" added to catalog!`, 'success');
      setIsAddModalOpen(false);
      fetchBooks();
      fetchGenres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add book', 'error');
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/books/${selectedBook.id}`, formData);
      showToast(`Book "${formData.title}" updated successfully!`, 'success');
      setIsEditModalOpen(false);
      fetchBooks();
      fetchGenres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update book', 'error');
    }
  };

  const handleDeleteBook = async () => {
    try {
      await api.delete(`/books/${selectedBook.id}`);
      showToast(`Book "${selectedBook.title}" deleted from catalog`, 'info');
      setIsDeleteModalOpen(false);
      fetchBooks();
      fetchGenres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete book', 'error');
    }
  };

  const handleIssueBookSubmit = async (e) => {
    e.preventDefault();
    if (!issueMemberId) {
      showToast('Please select a member', 'error');
      return;
    }
    try {
      await api.post('/borrow/issue', {
        bookId: selectedBook.id,
        memberId: issueMemberId,
        days: parseInt(issueDays),
        remarks: issueRemarks,
      });
      showToast(`Book "${selectedBook.title}" issued successfully!`, 'success');
      setIsIssueModalOpen(false);
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to issue book', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN, or publisher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-sm text-slate-300"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-sm text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canManageBooks && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          )}
        </div>
      </div>

      {/* Book Content (Grid or Table) */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-white">No books found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try adjusting your search query or filters to find what you are looking for.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="group flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Book Cover Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={book.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Genre pill & Status pill */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                      {book.genre}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge status={book.status} />
                  </div>

                  {/* Available Stock Indicator */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{book.availableCopies} / {book.totalCopies} Available</span>
                    </span>
                    {book.shelfLocation && (
                      <span className="text-slate-400 flex items-center gap-1 text-[11px] bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{book.shelfLocation}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">by {book.author}</p>
                  <p className="text-[11px] text-slate-500 font-mono">ISBN: {book.isbn}</p>
                  {book.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between gap-2">
                {canManageBooks ? (
                  <>
                    <button
                      onClick={() => handleOpenIssueModal(book)}
                      disabled={book.availableCopies <= 0}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        book.availableCopies > 0
                          ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
                          : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Issue Book</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(book)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                      title="Edit Book"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full py-1 text-center text-xs text-slate-400">
                    {book.availableCopies > 0 ? (
                      <span className="text-emerald-400 font-medium">✓ In Stock for Loan</span>
                    ) : (
                      <span className="text-rose-400 font-medium">Currently on loan</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 bg-slate-800/40 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Book Info</th>
                  <th className="px-4 py-3.5 font-semibold">Author & Publisher</th>
                  <th className="px-4 py-3.5 font-semibold">Genre</th>
                  <th className="px-4 py-3.5 font-semibold">Shelf</th>
                  <th className="px-4 py-3.5 font-semibold">Stock</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  {canManageBooks && <th className="px-4 py-3.5 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded-lg bg-slate-950 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{book.title}</p>
                          <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-300">{book.author}</p>
                      <p className="text-xs text-slate-500">{book.publisher || 'N/A'} ({book.publicationYear || 'N/A'})</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-indigo-300 font-semibold">{book.genre}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{book.shelfLocation || 'N/A'}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-200">
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={book.status} />
                    </td>
                    {canManageBooks && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenIssueModal(book)}
                            disabled={book.availableCopies <= 0}
                            className={`p-2 rounded-lg transition-colors ${
                              book.availableCopies > 0
                                ? 'text-indigo-400 hover:text-white hover:bg-indigo-600'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            title="Issue Book"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Book' : `Edit Book: ${selectedBook?.title}`}
      >
        <form onSubmit={isAddModalOpen ? handleCreateBook : handleUpdateBook} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">ISBN Code *</label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 978-0132350884"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Clean Code"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Robert C. Martin"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Publisher</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Prentice Hall"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Genre / Category *</label>
              <input
                type="text"
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Computer Science, Fiction, History..."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Publication Year</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 2024 })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Total Copies *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Shelf Location</label>
              <input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="e.g. Section CS-04"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description / Summary</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of the book content..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isAddModalOpen ? 'Create Book Entry' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title={`Issue Book: ${selectedBook?.title}`}
      >
        <form onSubmit={handleIssueBookSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
            <img
              src={selectedBook?.coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
              alt={selectedBook?.title}
              className="w-12 h-16 object-cover rounded-lg bg-slate-950 shrink-0"
            />
            <div>
              <h5 className="text-sm font-bold text-white">{selectedBook?.title}</h5>
              <p className="text-xs text-slate-400">Author: {selectedBook?.author}</p>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                {selectedBook?.availableCopies} copies currently available
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Member / Student *</label>
            <select
              required
              value={issueMemberId}
              onChange={(e) => setIssueMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
            >
              <option value="" disabled>Choose a registered member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} (@{m.username}) - {m.activeBorrowsCount} active loans
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Loan Period (Days)</label>
              <select
                value={issueDays}
                onChange={(e) => setIssueDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200"
              >
                <option value="7">7 Days (1 Week)</option>
                <option value="14">14 Days (2 Weeks - Standard)</option>
                <option value="21">21 Days (3 Weeks)</option>
                <option value="30">30 Days (1 Month)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date Calculation</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>
                  {new Date(Date.now() + issueDays * 86400000).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks / Note (Optional)</label>
            <input
              type="text"
              value={issueRemarks}
              onChange={(e) => setIssueRemarks(e.target.value)}
              placeholder="e.g. Semester research assignment"
              className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Confirm & Issue Book</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Book Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <p>
              Are you sure you want to delete <strong>"{selectedBook?.title}"</strong>? This will remove the book and its inventory record permanently.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBook}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              Delete Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
