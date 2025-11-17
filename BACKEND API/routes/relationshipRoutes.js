const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    generateTeacherCode,
    getTeacherCodeHandler,
    linkStudentByCode,
    getStudentsHandler,
    getStudentRelationsHandler,
    unlinkStudent
} = require('../controllers/relationshipController');

// Aplica o middleware de autenticação a todas as rotas deste arquivo
router.use(authMiddleware);

// Rotas para Professores
router.post('/teacher-code', generateTeacherCode);       // Gera um novo código para o professor logado
router.get('/teacher-code', getTeacherCodeHandler);         // Obtém o código ativo do professor logado
router.get('/students', getStudentsHandler);             // Lista os alunos vinculados ao professor logado

// Rotas para Alunos
router.post('/link-student', linkStudentByCode);           // Aluno se vincula a um professor usando um código
router.get('/teachers', getStudentRelationsHandler);     // Lista os professores aos quais o aluno está vinculado

// Rotas Comuns
router.delete('/unlink-student/:relationId', unlinkStudent); // Desfaz um vínculo (professor ou aluno pode fazer)

module.exports = router;
