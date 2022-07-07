const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType,
} = require('graphql');

const Client = require('../models/Client');
const Project = require('../models/Project');

// client type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
    }),
});

// project type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, _) {
                return Client.findById(parent.clientId);
            },
        },
    }),
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(_, __) {
                return Project.find();
            },
        },
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            resolve(_, args) {
                return Project.findById(args.id);
            },
        },
        clients: {
            type: new GraphQLList(ClientType),
            resolve(_, __) {
                return Client.find();
            },
        },
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            resolve(_, args) {
                return Client.findById(args.id);
            },
        },
    },
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add a client
        addClient: {
            type: ClientType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(_, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                });
                return client.save();
            },
        },
        // Delete a client
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(_, args) {
                Project.find({ clientID: args.id }).then((projects) => {
                    projects.forEach((project) => {
                        project.remove();
                    });
                });
                return Client.findByIdAndRemove(args.id);
            },
        },
        // Add a project
        addProject: {
            type: ProjectType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            new: { value: 'Not Started' },
                            progress: { value: 'In Progress' },
                            completed: { value: 'Completed' },
                        },
                    }),
                    defaultValue: 'Not Started',
                },
                clientId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(_, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });

                return project.save();
            },
        },
        // Delete a project
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve(_, args) {
                return Project.findByIdAndRemove(args.id);
            },
        },
        // Update a project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            new: { value: 'Not Started' },
                            progress: { value: 'In Progress' },
                            completed: { value: 'Completed' },
                        },
                    }),
                },
            },
            resolve(_, args) {
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status,
                        },
                    },
                    { new: true }
                );
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});
