import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Coach from '../models/coach.model.js';
import User from '../models/user.model.js';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config/.env') });

const coaches = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach1_m5soqf.jpg',
    coachProfile: {
      specializations: ['weight_training', 'powerlifting', 'bodybuilding'],
      experience: 10,
      certifications: [
        {
          name: 'Certified Strength and Conditioning Specialist',
          issuer: 'NSCA',
          year: 2015
        }
      ],
      hourlyRate: 75,
      branches: ['main_branch', 'downtown_branch'],
      availability: [
        {
          day: 'monday',
          slots: [
            { startTime: '09:00', endTime: '17:00' }
          ]
        },
        {
          day: 'wednesday',
          slots: [
            { startTime: '09:00', endTime: '17:00' }
          ]
        },
        {
          day: 'friday',
          slots: [
            { startTime: '09:00', endTime: '17:00' }
          ]
        }
      ],
      about: 'Certified strength coach with 10+ years of experience helping clients achieve their fitness goals.'
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach2_k9gvwp.jpg',
    coachProfile: {
      specializations: ['cardio', 'weight_training', 'nutrition'],
      experience: 8,
      certifications: [
        {
          name: 'Certified Personal Trainer',
          issuer: 'NASM',
          year: 2016
        }
      ],
      hourlyRate: 65,
      branches: ['downtown_branch', 'west_end_branch'],
      availability: [
        {
          day: 'tuesday',
          slots: [
            { startTime: '07:00', endTime: '15:00' }
          ]
        },
        {
          day: 'thursday',
          slots: [
            { startTime: '07:00', endTime: '15:00' }
          ]
        },
        {
          day: 'saturday',
          slots: [
            { startTime: '09:00', endTime: '14:00' }
          ]
        }
      ],
      about: 'Passionate about helping people transform their lives through high-intensity training and nutrition guidance.'
    }
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach3_rqpixl.jpg',
    coachProfile: {
      specializations: ['bodybuilding', 'weight_training', 'nutrition'],
      experience: 12,
      certifications: [
        {
          name: 'IFBB Professional',
          issuer: 'IFBB',
          year: 2018
        }
      ],
      hourlyRate: 85,
      branches: ['main_branch', 'east_end_branch', 'north_branch'],
      availability: [
        {
          day: 'monday',
          slots: [
            { startTime: '10:00', endTime: '18:00' }
          ]
        },
        {
          day: 'wednesday',
          slots: [
            { startTime: '10:00', endTime: '18:00' }
          ]
        },
        {
          day: 'friday',
          slots: [
            { startTime: '10:00', endTime: '18:00' }
          ]
        }
      ],
      about: 'Professional bodybuilder and certified trainer specializing in muscle growth and competition prep.'
    }
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach4_xkpxl8.jpg',
    coachProfile: {
      specializations: ['yoga', 'pilates', 'meditation'],
      experience: 7,
      certifications: [
        {
          name: 'Registered Yoga Teacher',
          issuer: 'Yoga Alliance',
          year: 2017
        },
        {
          name: 'Pilates Instructor',
          issuer: 'Pilates Method Alliance',
          year: 2019
        }
      ],
      hourlyRate: 70,
      branches: ['downtown_branch', 'west_end_branch'],
      availability: [
        {
          day: 'monday',
          slots: [
            { startTime: '08:00', endTime: '16:00' }
          ]
        },
        {
          day: 'wednesday',
          slots: [
            { startTime: '08:00', endTime: '16:00' }
          ]
        },
        {
          day: 'friday',
          slots: [
            { startTime: '08:00', endTime: '16:00' }
          ]
        }
      ],
      about: 'Dedicated yoga and pilates instructor focused on mindful movement and holistic wellness.'
    }
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach5_qwerty.jpg',
    coachProfile: {
      specializations: ['martial_arts', 'kickboxing', 'self_defense'],
      experience: 15,
      certifications: [
        {
          name: '4th Degree Black Belt',
          issuer: 'World Taekwondo Federation',
          year: 2010
        },
        {
          name: 'Certified Kickboxing Instructor',
          issuer: 'International Kickboxing Federation',
          year: 2015
        }
      ],
      hourlyRate: 90,
      branches: ['main_branch', 'north_branch'],
      availability: [
        {
          day: 'tuesday',
          slots: [
            { startTime: '14:00', endTime: '20:00' }
          ]
        },
        {
          day: 'thursday',
          slots: [
            { startTime: '14:00', endTime: '20:00' }
          ]
        },
        {
          day: 'saturday',
          slots: [
            { startTime: '10:00', endTime: '16:00' }
          ]
        }
      ],
      about: 'Experienced martial arts instructor specializing in practical self-defense and disciplined training.'
    }
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach6_asdfgh.jpg',
    coachProfile: {
      specializations: ['crossfit', 'functional_training', 'olympic_lifting'],
      experience: 9,
      certifications: [
        {
          name: 'CrossFit Level 3 Trainer',
          issuer: 'CrossFit Inc.',
          year: 2018
        },
        {
          name: 'USA Weightlifting Sports Performance Coach',
          issuer: 'USAW',
          year: 2016
        }
      ],
      hourlyRate: 80,
      branches: ['east_end_branch', 'south_branch'],
      availability: [
        {
          day: 'monday',
          slots: [
            { startTime: '06:00', endTime: '14:00' }
          ]
        },
        {
          day: 'wednesday',
          slots: [
            { startTime: '06:00', endTime: '14:00' }
          ]
        },
        {
          day: 'friday',
          slots: [
            { startTime: '06:00', endTime: '14:00' }
          ]
        }
      ],
      about: 'CrossFit enthusiast and Olympic lifting specialist dedicated to helping athletes reach their full potential.'
    }
  },
  {
    name: 'Marcus Rodriguez',
    email: 'marcus.rodriguez@example.com',
    password: 'password123',
    role: 'coach',
    profilePicture: 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/coach7_zxcvbn.jpg',
    coachProfile: {
      specializations: ['boxing', 'hiit', 'strength_conditioning'],
      experience: 11,
      certifications: [
        {
          name: 'USA Boxing Coach',
          issuer: 'USA Boxing',
          year: 2014
        },
        {
          name: 'NASM Performance Enhancement Specialist',
          issuer: 'NASM',
          year: 2017
        }
      ],
      hourlyRate: 85,
      branches: ['downtown_branch', 'south_branch'],
      availability: [
        {
          day: 'tuesday',
          slots: [
            { startTime: '11:00', endTime: '19:00' }
          ]
        },
        {
          day: 'thursday',
          slots: [
            { startTime: '11:00', endTime: '19:00' }
          ]
        },
        {
          day: 'saturday',
          slots: [
            { startTime: '09:00', endTime: '15:00' }
          ]
        }
      ],
      about: 'Former professional boxer turned fitness coach, specializing in high-intensity workouts and boxing technique.'
    }
  }
];

const seedCoaches = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'production' ? process.env.MONGO_URL : process.env.MONGO_TEST;
    if (!mongoUri) {
      throw new Error('MongoDB connection URI is not defined');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing coaches and users
    await Coach.deleteMany({});
    await User.deleteMany({ role: 'coach' });
    console.log('Cleared existing coaches and their users');

    // Create coaches
    for (const coachData of coaches) {
      // Create user first
      const user = await User.create({
        name: coachData.name,
        email: coachData.email,
        password: coachData.password,
        role: coachData.role
      });

      // Create coach profile
      const defaultProfilePicture = 'https://res.cloudinary.com/dxrksxul/image/upload/v1682456665/default-avatar_f2fb1x.jpg';
      const coach = await Coach.create({
        user: user._id,
        profilePicture: coachData.profilePicture || defaultProfilePicture,
        specializations: coachData.coachProfile.specializations,
        experience: coachData.coachProfile.experience,
        certifications: coachData.coachProfile.certifications,
        hourlyRate: coachData.coachProfile.hourlyRate,
        branches: coachData.coachProfile.branches,
        availability: coachData.coachProfile.availability,
        about: coachData.coachProfile.about,
        rating: {
          average: 0,
          count: 0
        }
      });

      console.log(`Created coach: ${coach.user}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedCoaches();
