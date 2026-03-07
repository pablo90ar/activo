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
router.use('/trainee', traineesRoutes);
router.use('/routine', routinesRoutes);
router.use('/trainee-routine', traineeRoutinesRoutes);
router.use('/training-day', trainingDaysRoutes);
router.use('/day-set', daySetsRoutes);
router.use('/exercises-set', exercisesSetsRoutes);
router.use('/exercise', exercisesRoutes);
router.use('/muscle-group', muscleGroupsRoutes);
router.use('/exercise-group', exerciseGroupRoutes);
router.use('/tools', toolsRoutes);
router.use('/tool', toolsRoutes);
router.use('/exercise-tool', exerciseToolsRoutes);
router.use('/completed-training-day', completedTrainingDaysRoutes);

export default router;
