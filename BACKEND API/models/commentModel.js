const Comment = require('../models/Comment');
const CommentResponse = require('../models/CommentResponse');
const TeacherStudent = require('../models/TeacherStudent');
const User = require('../models/User');
const logger = require('../utils/logger');

const addComment = async (commentData) => {
  try {
    const comment = new Comment({ ...commentData, created_at: new Date() });
    await comment.save();
    return comment._id.toString();
  } catch (error) {
    logger.error(`Erro ao adicionar comentário: ${error.message}`);
    throw error;
  }
};

const getTeacherComments = async (teacherId) => {
  try {
    // 1. Buscar alunos vinculados ao professor
    const relations = await TeacherStudent.find({ teacher_id: teacherId });
    const studentIds = relations.map(r => r.student_id);

    if (studentIds.length === 0) return [];

    // 2. Buscar comentários desses alunos
    const comments = await Comment.find({ user_id: { $in: studentIds } })
      .sort({ created_at: -1 })
      .lean();

    // 3. Buscar respostas de cada comentário
    const commentIds = comments.map(c => c._id);
    const responses = await CommentResponse.find({ comment_id: { $in: commentIds } })
      .sort({ created_at: 1 })
      .lean();

    // 4. Montar estrutura com respostas
    return comments.map(comment => ({
      id: comment._id.toString(),
      question_id: comment.question_id.toString(),
      question_theme: comment.question_theme,
      question_text: comment.question_text,
      user_id: comment.user_id.toString(),
      user_name: comment.user_name,
      user_type: comment.user_type,
      message: comment.message,
      created_at: comment.created_at.toISOString(),
      responses: responses
        .filter(r => r.comment_id.toString() === comment._id.toString())
        .map(r => ({
          id: r._id.toString(),
          comment_id: r.comment_id.toString(),
          user_id: r.user_id.toString(),
          user_name: r.user_name,
          user_type: r.user_type,
          message: r.message,
          created_at: r.created_at.toISOString()
        }))
    }));

  } catch (error) {
    logger.error(`Erro ao buscar comentários do professor: ${error.message}`);
    throw error;
  }
};

const getStudentComments = async (studentId) => {
  try {
    const comments = await Comment.find({ user_id: studentId })
      .sort({ created_at: -1 })
      .lean();

    const commentIds = comments.map(c => c._id);
    const responses = await CommentResponse.find({ comment_id: { $in: commentIds } })
      .sort({ created_at: 1 })
      .lean();

    return comments.map(comment => ({
      id: comment._id.toString(),
      questionId: comment.question_id.toString(),
      questionTheme: comment.question_theme,
      questionText: comment.question_text,
      userId: comment.user_id.toString(),
      userName: comment.user_name,
      userType: comment.user_type,
      message: comment.message,
      createdAt: comment.created_at.toISOString(),
      responses: responses
        .filter(r => r.comment_id.toString() === comment._id.toString())
        .map(r => ({
          id: r._id.toString(),
          commentId: r.comment_id.toString(),
          userId: r.user_id.toString(),
          userName: r.user_name,
          userType: r.user_type,
          message: r.message,
          createdAt: r.created_at.toISOString()
        }))
    }));
  } catch (error) {
    logger.error(`Erro ao listar comentários do aluno ${studentId}: ${error.message}`);
    throw error;
  }
};

const addCommentResponse = async (responseData) => {
  try {
    const response = new CommentResponse({ ...responseData, created_at: new Date() });
    await response.save();
    return response._id.toString();
  } catch (error) {
    logger.error(`Erro ao adicionar resposta ao comentário: ${error.message}`);
    throw error;
  }
};

module.exports = { addComment, getTeacherComments, getStudentComments, addCommentResponse };