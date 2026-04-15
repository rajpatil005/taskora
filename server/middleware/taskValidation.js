import { body, param } from 'express-validator';

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  body('category')
    .isIn(['shopping', 'delivery', 'cleaning', 'moving', 'repair', 'photography', 'tutoring', 'other'])
    .withMessage('Invalid category'),
  body('estimatedPrice')
    .isNumeric()
    .custom(value => value > 0)
    .withMessage('Estimated price must be greater than 0'),
  body('rewardAmount')
    .isNumeric()
    .custom(value => value > 0)
    .withMessage('Reward amount must be greater than 0'),
  body('location.latitude')
    .isNumeric()
    .withMessage('Valid latitude required'),
  body('location.longitude')
    .isNumeric()
    .withMessage('Valid longitude required')
];

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

export const taskIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID')
];
