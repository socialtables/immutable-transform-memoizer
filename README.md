# Immutable Transform Memoizer
A utility function for reusing results of transformations over Immutable.js
collections.

This library is intended for use in apps that need to propagate small changes
through large Immutable Collections without wasting time and memory redoing
work on objects that have not changed. It can make frequent .toJS operations
significantly faster by avoiding re-traversal of nested Collections.
