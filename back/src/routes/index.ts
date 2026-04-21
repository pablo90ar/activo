import { Router } from 'express';
import traineesRoutes from './trainees';
import routinesRoutes from './routines';
import traineeRoutinesRoutes from './trainee-routines';
import trainingDaysRoutes from './training-days';
import daySetsRoutes from './day-sets';
import exercisesSetsRoutes from './exercises-sets';
import exercisesRoutes from './exercises';
import tagsRoutes from './tags';
import exerciseTagRoutes from './exercise-tags';
import historyRoutes from './history';
import activeTrainingRoutes from './active-training';
import settingsRoutes from './settings';
import authRoutes from './auth';

const router = Router();

// Health check
router.get('/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'Hola Julita :)' });
});

// Montar rutas de entidades
router.use('/trainees', traineesRoutes);
router.use('/routines', routinesRoutes);
router.use('/trainee-routines', traineeRoutinesRoutes);
router.use('/training-days', trainingDaysRoutes);
router.use('/day-sets', daySetsRoutes);
router.use('/exercises-sets', exercisesSetsRoutes);
router.use('/exercises', exercisesRoutes);
router.use('/tags', tagsRoutes);
router.use('/exercise-tags', exerciseTagRoutes);
router.use('/history', historyRoutes);
router.use('/active-training', activeTrainingRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);

export default router;
