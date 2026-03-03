import { Router } from 'express';
import traineesRoutes from './trainees';
import routinesRoutes from './routines';
import traineeRoutinesRoutes from './trainee-routines';
import trainingDaysRoutes from './training-days';
import daySetsRoutes from './day-sets';
import exercisesSetsRoutes from './exercises-sets';
import exercisesRoutes from './exercises';
import muscleGroupsRoutes from './muscle-groups';
import exerciseGroupsRoutes from './exercise-groups';
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
router.use('/trainee', traineesRoutes); // Alias for single trainee
router.use('/routines', routinesRoutes);
router.use('/routine', routinesRoutes); // Alias for single routine
router.use('/trainee-routines', traineeRoutinesRoutes);
router.use('/trainee-routine', traineeRoutinesRoutes); // Alias for single trainee-routine
router.use('/training-days', trainingDaysRoutes);
router.use('/training-day', trainingDaysRoutes); // Alias for single training-day
router.use('/day-sets', daySetsRoutes);
router.use('/day-set', daySetsRoutes); // Alias for single day-set
router.use('/exercises-sets', exercisesSetsRoutes);
router.use('/exercises-set', exercisesSetsRoutes); // Alias for single exercises-set
router.use('/exercises', exercisesRoutes);
router.use('/exercise', exercisesRoutes); // Alias for single exercise
router.use('/muscle-groups', muscleGroupsRoutes);
router.use('/muscle-group', muscleGroupsRoutes); // Alias for single muscle-group
router.use('/exercise-groups', exerciseGroupsRoutes);
router.use('/tools', toolsRoutes);
router.use('/tool', toolsRoutes); // Alias for single tool
router.use('/exercise-tools', exerciseToolsRoutes);
router.use('/completed-training-days', completedTrainingDaysRoutes);
router.use('/completed-training-day', completedTrainingDaysRoutes); // Alias for single completed-training-day

export default router;
