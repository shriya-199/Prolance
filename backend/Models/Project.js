const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Programming & Tech',
            'Graphics & Design',
            'Digital Marketing',
            'Writing & Translation',
            'Video & Animation',
            'AI Services',
            'Music & Audio',
            'Business',
            'Consulting',
            'Other'
        ]
    },
    budget: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['fixed', 'hourly'],
            default: 'fixed'
        }
    },
    duration: {
        type: String,
        required: true
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    proposalCount: {
        type: Number,
        default: 0
    },
    acceptedProposalId: {
        type: Schema.Types.ObjectId,
        ref: 'proposals',
        default: null
    },
    attachments: {
        type: [{
            name: String,
            url: String
        }],
        default: []
    },
    deadline: {
        type: Date,
        default: null
    },
    tags: {
        type: [String],
        default: []
    },
    viewCount: {
        type: Number,
        default: 0
    },
    viewedBy: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'users'
        }],
        default: []
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    thumbnail: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Index for search and filtering
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ createdAt: -1 });

const ProjectModel = mongoose.model('projects', ProjectSchema);
module.exports = ProjectModel;
