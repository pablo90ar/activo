import { Router } from 'express';
import traineesRoutes from './trainees';
import routinesRoutes from './routines';
import traineeRoutinesRoutes from './trainee-routines';
import trainingDaysRoutes from './training-days';
import daySetsRoutes from './day-sets';
import exercisesSetsRoutes from './exercises-sets';
import exercisesRoutes from './exercises';
import muscleGroupsRoutes from './muscle-groups';
import exerciseGroupRoutes from './exercise-groups';
import toolsRoutes from './tools';
import exerciseToolsRoutes from './exercise-tools';
import completedTrainingDaysRoutes from './completed-training-days';

const router = Router();

// Health check
router.get('/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'Hola Julita :)' });
});

// Mount entity routes
router.use('/trainees', traineesRoutes);
router.use('/routines', routinesRoutes);
router.use('/trainee-routines', traineeRoutinesRoutes);
router.use('/training-days', trainingDaysRoutes);
router.use('/day-sets', daySetsRoutes);
router.use('/exercises-sets', exercisesSetsRoutes);
router.use('/exercises', exercisesRoutes);
router.use('/muscle-groups', muscleGroupsRoutes);
router.use('/exercise-groups', exerciseGroupRoutes);
router.use('/tools', toolsRoutes);
router.use('/exercise-tools', exerciseToolsRoutes);
router.use('/completed-training-days', completedTrainingDaysRoutes);

export default router;
