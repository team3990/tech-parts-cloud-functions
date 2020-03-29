const PROJECTS = require('../util/constants').PROJECTS;
const firestoreInstance = require('../index').firestoreInstance;
const notificationService = require('./../service/notification.service');

/** 
 * Returns the Cloud Firestore Document corresponding to the project with the 
 * provided identifier.
 *
 * @param id A string representing the identifier of the project that is being
 *           retrieved.
 * */
exports.getProject = function getProject(id) {
  return firestoreInstance.collection(PROJECTS).doc(id).get();
};

/**
 * Updates the cost of the project with the given identifier using the provided
 * cost.
 *
 * @param id             A string representing the identifier of the project the cost
 *                       belongs to.
 * @param additionalCost An integer representing the additional cost of the project.
 * */
exports.updateProjectCost = async function updateProjectCost(id, additionalCost) {
  const projectDoc = await firestoreInstance.collection(PROJECTS).doc(id).get();

  // Get the current cost of the project.
  const currentCost = projectDoc.get('totalCost');

  return firestoreInstance.collection(PROJECTS).doc(id).update({
    'totalCost': currentCost + additionalCost
  });
};

/**
 * Decreases the amount of assemblies count of the project with the given identifier.
 *
 * @param id A string representing the identifier of the project the assembly count
 *           belongs to.
 * */
exports.reduceAssemblyCount = async function reduceAssemblyCount(id) {
  const project = await firestoreInstance.collection(PROJECTS).doc(id).get();
  const currentAssemblyCount = project.get('assembliesCount');

  return project.ref.update({
    'assembliesCount': currentAssemblyCount - 1
  });
};

/**
 * Increases the amount of assemblies count of the project with the given identifier.
 *
 * @param id A string representing the identifier of the project the assembly count
 *           belongs to.
 * */
exports.incrementProjectAssemblyCount = async function incrementProjectAssemblyCount(id) {
  const project = await firestoreInstance.collection(PROJECTS).doc(id).get();
  const currentAssemblyCount = project.get('assembliesCount');

  return project.ref.update({
    'assembliesCount': currentAssemblyCount + 1
  });
};

/**
 * Sends a FCM notification to all the team members to let them know that an assembly
 * was created.
 */
exports.sendAssemblyCreationNotification = async function sendAssemblyCreationNotification(projectName) {
  const fcmTokens = await notificationService.getAllFCMTokens();
  
  // Send a notification to all the team members.
  return notificationService.sendPushNotificationToMultiple("Un nouvel assemblage a été créé", "Un nouvel assemblage a été ajouté au projet " + projectName, fcmTokens);
};

/**
 * Sends a FCM notification to all the team members to let them know that the progress of an
 * assembly has changed.
 */
exports.sendAssemblyProgressChangedNotification = async function sendAssemblyProgressChangedNotification(assemblyCode, assemblyName, assemblyProgress) {
  const fcmTokens = await notificationService.getAllFCMTokens();
  
  // Send a notification to all the team members.
  return notificationService.sendPushNotificationToMultiple("L'état d'un assemblage a changé", `L'assemblage ${assemblyCode} (${assemblyName}) est passé à l'état « ${assemblyProgress} »`, fcmTokens);
};
