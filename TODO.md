# TODO - Fix BpmnModdle merge

- [x] Update `client/src/components/BpmnModdle.js` to properly remap IDs **and** update all references to those IDs after renaming.
- [ ] Keep current offset logic for DI elements; optionally extend if DI is still misplaced after reference remap.
- [ ] Quick manual test: merge two BPMN XMLs from `BpmnCards.jsx` and ensure `bpmnModelerRef.current.importXML(mergedXml)` renders without warnings.


