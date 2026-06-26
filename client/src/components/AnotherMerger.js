function mergeBpmnXml(xml1, xml2) {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  const doc1 = parser.parseFromString(xml1, "application/xml");
  const doc2 = parser.parseFromString(xml2, "application/xml");

  assertNoParsError(doc1, "xml1");
  assertNoParsError(doc2, "xml2");

  const root1 = doc1.documentElement; // <bpmn:definitions>
  const root2 = doc2.documentElement;

  // 1. Merge namespace declarations from doc2 into doc1 (if any are missing)
  for (const attr of root2.attributes) {
    if (attr.name.startsWith("xmlns") && !root1.hasAttribute(attr.name)) {
      root1.setAttribute(attr.name, attr.value);
    }
  }

  function buildProcessMap(root) {
    const map = new Map();
    for (const el of root.children) {
      if (el.localName === "process") {
        map.set(el.getAttribute("id"), el);
      }
    }
    return map;
  }

  const processes1 = buildProcessMap(root1);

  // 2. Find (or create) the single <bpmn:collaboration> in doc1
  const collab1 = findChild(root1, "collaboration");

  // 3. Find the single <bpmndi:BPMNPlane> in doc1
  const plane1 = findDescendant(root1, "BPMNPlane");

  // 4. Iterate over top-level children of doc2's root
  for (const child2 of [...root2.children]) {
    const localName = child2.localName; // e.g. "collaboration", "process", "BPMNDiagram"

    if (localName === "collaboration") {
      // Merge participants into doc1's collaboration
      if (collab1) {
        for (const participant of [...child2.children]) {
          const imported = doc1.importNode(participant, true);
          collab1.appendChild(imported);
        }
      } else {
        // No collaboration in doc1 yet — import the whole element
        root1.appendChild(doc1.importNode(child2, true));
      }

    } else if (localName === "process") {
      // // Append each process from doc2 directly (they have distinct IDs)
      // root1.appendChild(doc1.importNode(child2, true));
      
      const processId = child2.getAttribute("id");
      const matchingProcess1 = processes1.get(processId);

      if (matchingProcess1) {
        // Same ID — merge children into the existing process in doc1
        for (const processChild of [...child2.children]) {
          matchingProcess1.appendChild(doc1.importNode(processChild, true));
        }
      } else if (child2.children.length > 0) {
        // Different ID and non-empty — append as a new process
        root1.appendChild(doc1.importNode(child2, true));
      }

    } else if (localName === "BPMNDiagram") {
      // Merge shapes/edges from doc2's BPMNPlane into doc1's BPMNPlane
      const plane2 = findDescendant(child2, "BPMNPlane");
      if (plane2 && plane1) {
        for (const diElement of [...plane2.children]) {
          plane1.appendChild(doc1.importNode(diElement, true));
        }
      } else if (!plane1) {
        // No diagram in doc1 yet — import the whole BPMNDiagram
        root1.appendChild(doc1.importNode(child2, true));
      }
    }
    // Any other element types are appended as-is
    else {
      root1.appendChild(doc1.importNode(child2, true));
    }
  }

  return serializer.serializeToString(doc1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Throws if the parsed document contains a <parsererror> */
function assertNoParsError(doc, label) {
  if (doc.querySelector("parsererror")) {
    throw new Error(`Failed to parse ${label}: ${doc.querySelector("parsererror").textContent}`);
  }
}

/** Returns the first direct child whose localName matches (namespace-agnostic) */
function findChild(parent, localName) {
  return [...parent.children].find((el) => el.localName === localName) ?? null;
}

/** Returns the first descendant at any depth whose localName matches */
function findDescendant(root, localName) {
  return root.querySelector(`*`) // all descendants
    ? [...root.querySelectorAll("*")].find((el) => el.localName === localName) ?? null
    : null;
}

export default mergeBpmnXml