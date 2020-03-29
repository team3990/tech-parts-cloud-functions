const admin = require('firebase-admin');
const mapper = require('./util/mapper.utils');
const functions = require('firebase-functions');
const projectRepository = require('./repository/project.repository');

/** Initialize the application. */
admin.initializeApp();

/** Get an instance of the project's Cloud Firestore database. */
exports.firestoreInstance = admin.firestore();

exports.onAsssemblyDeleted = functions.firestore.document('/assemblies/{assemblyId}').onDelete(async (snapshot, _) => {
  const projectId = snapshot.get('projectId');
  const assemblyCost = snapshot.get('totalCost');

  // Update the project's count.
  await projectRepository.updateProjectCost(projectId, -assemblyCost);

  // Update the project's assembly count.
  await projectRepository.reduceAssemblyCount(projectId);
});

exports.onAsssemblyCreated = functions.firestore.document('/assemblies/{assemblyId}').onCreate(async (snapshot, _) => {
  const projectId = snapshot.get('projectId');

  // Get the project associated with the assembly.
  const project = await projectRepository.getProject(projectId);

  // Update the project's assemblies count.
  await projectRepository.incrementProjectAssemblyCount(projectId);

  // Let the team members know that a new assembly was created.
  await projectRepository.sendAssemblyCreationNotification(project.get('name'));
});

exports.onAssemblyProgressChanged = functions.firestore.document('/assemblies/{assemblyId}').onUpdate(async (snapshot, _) => {
  const newProgress = snapshot.after.get('state');
  const oldProgress = snapshot.before.get('state');

  // Get the identifier of the project and the cost of the assembly.
  const projectId = snapshot.after.get('projectId');
  const assemblyCost = snapshot.after.get('totalCost');

  // Update the project's cost.
  await projectRepository.updateProjectCost(projectId, assemblyCost);

  // Let the team members know that the progress of the assembly changed,
  // if applicable.
  if (newProgress !== oldProgress) {
    const progressString = mapper.getProgressString(newProgress).toLowerCase();

    await projectRepository.sendAssemblyProgressChangedNotification(
      snapshot.before.get('code'),
      snapshot.before.get('name'),
      progressString
    );
  }
});
