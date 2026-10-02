import { describe, it, expect } from "vitest";
import type { WsFolder, WsFile, WsNode } from "@/types";
import {
  findNode,
  insertChild,
  removeNode,
  renameNode,
  updateFile,
} from "./workspace";

describe("workspace tree operations", () => {
  const createInitialTree = (): WsNode[] => [
    {
      id: "root-folder-1",
      kind: "folder",
      name: "docs",
      children: [
        {
          id: "nested-folder-1",
          kind: "folder",
          name: "guide",
          children: [
            {
              id: "deep-folder-1",
              kind: "folder",
              name: "advanced",
              children: [],
            },
            {
              id: "file-1",
              kind: "file",
              name: "intro.md",
              content: "# Intro",
            },
          ],
        },
      ],
    },
    {
      id: "root-file-1",
      kind: "file",
      name: "README.md",
      content: "# Hello",
    },
  ];

  describe("insertChild", () => {
    it("should insert a file at root level when parentId is null", () => {
      const tree = createInitialTree();
      const newFile: WsFile = {
        id: "new-root-file",
        kind: "file",
        name: "test.md",
        content: "",
      };
      const result = insertChild(tree, null, newFile);
      expect(result).toHaveLength(3);
      expect(result.some((n) => n.id === "new-root-file")).toBe(true);
    });

    it("should insert a file inside a 1-level folder", () => {
      const tree = createInitialTree();
      const newFile: WsFile = {
        id: "new-file-in-docs",
        kind: "file",
        name: "index.md",
        content: "",
      };
      const result = insertChild(tree, "root-folder-1", newFile);
      const hit = findNode(result, "root-folder-1");
      expect(hit).not.toBeNull();
      const folder = hit!.node as WsFolder;
      expect(folder.children.some((c) => c.id === "new-file-in-docs")).toBe(true);
    });

    it("should insert a file inside a nested subfolder (2-level deep)", () => {
      const tree = createInitialTree();
      const newFile: WsFile = {
        id: "new-file-in-guide",
        kind: "file",
        name: "nested.md",
        content: "# Nested",
      };
      const result = insertChild(tree, "nested-folder-1", newFile);
      const hit = findNode(result, "nested-folder-1");
      expect(hit).not.toBeNull();
      const folder = hit!.node as WsFolder;
      expect(folder.children.some((c) => c.id === "new-file-in-guide")).toBe(true);
    });

    it("should insert a file inside a deeply nested subfolder (3-level deep)", () => {
      const tree = createInitialTree();
      const newFile: WsFile = {
        id: "new-file-in-advanced",
        kind: "file",
        name: "deep.md",
        content: "",
      };
      const result = insertChild(tree, "deep-folder-1", newFile);
      const hit = findNode(result, "deep-folder-1");
      expect(hit).not.toBeNull();
      const folder = hit!.node as WsFolder;
      expect(folder.children.some((c) => c.id === "new-file-in-advanced")).toBe(true);
    });

    it("should insert a folder inside a nested subfolder", () => {
      const tree = createInitialTree();
      const newFolder: WsFolder = {
        id: "new-sub-folder",
        kind: "folder",
        name: "components",
        children: [],
      };
      const result = insertChild(tree, "nested-folder-1", newFolder);
      const hit = findNode(result, "nested-folder-1");
      expect(hit).not.toBeNull();
      const folder = hit!.node as WsFolder;
      expect(folder.children.some((c) => c.id === "new-sub-folder")).toBe(true);
    });
  });

  describe("removeNode", () => {
    it("should remove a deeply nested file", () => {
      const tree = createInitialTree();
      const result = removeNode(tree, "file-1");
      expect(findNode(result, "file-1")).toBeNull();
      const guideHit = findNode(result, "nested-folder-1");
      expect(guideHit).not.toBeNull();
      const guideFolder = guideHit!.node as WsFolder;
      expect(guideFolder.children.some((c) => c.id === "file-1")).toBe(false);
    });

    it("should remove a nested folder and all its contents", () => {
      const tree = createInitialTree();
      const result = removeNode(tree, "nested-folder-1");
      expect(findNode(result, "nested-folder-1")).toBeNull();
      expect(findNode(result, "deep-folder-1")).toBeNull();
      expect(findNode(result, "file-1")).toBeNull();
    });
  });

  describe("renameNode", () => {
    it("should rename a nested folder", () => {
      const tree = createInitialTree();
      const result = renameNode(tree, "nested-folder-1", "getting-started");
      const hit = findNode(result, "nested-folder-1");
      expect(hit).not.toBeNull();
      expect(hit!.node.name).toBe("getting-started");
    });

    it("should rename a deeply nested file", () => {
      const tree = createInitialTree();
      const result = renameNode(tree, "file-1", "overview.md");
      const hit = findNode(result, "file-1");
      expect(hit).not.toBeNull();
      expect(hit!.node.name).toBe("overview.md");
    });
  });

  describe("updateFile", () => {
    it("should update file content in nested folder", () => {
      const tree = createInitialTree();
      const result = updateFile(tree, "file-1", "New content");
      const hit = findNode(result, "file-1");
      expect(hit).not.toBeNull();
      expect((hit!.node as WsFile).content).toBe("New content");
    });
  });
});
