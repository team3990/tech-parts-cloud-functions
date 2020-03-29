
/**
 * Returns a string representing the progress corresponding to the provided
 * progress identifier.
 */
exports.getProgressString = function getProgressString(progressIdentifier) {
    if (progressIdentifier === 'toDo') {
        return "À compléter";
    } else if (progressIdentifier === 'inProgress') {
        return "En progrès";
    }

    return "Completé";
}
