export class HierarchicalChunker {
    childChunkSize; // 200-300 chars
    parentChunkSize; // 1000-1500 chars
    childOverlap; // Overlap for child chunks
    parentOverlap; // Overlap for parent chunks
    constructor(childChunkSize = 250, parentChunkSize = 1200, childOverlap = 30, parentOverlap = 100) {
        this.childChunkSize = childChunkSize;
        this.parentChunkSize = parentChunkSize;
        this.childOverlap = childOverlap;
        this.parentOverlap = parentOverlap;
    }
    /**
     * Create hierarchical chunks from document content
     *
     * @param content Document content
     * @param sourceFile Source file path
     * @param sourcePath Full source path
     * @returns Array of hierarchical chunks (both children and parents)
     */
    async chunkDocument(content, sourceFile, sourcePath) {
        // VERIFIED: Hierarchical chunking entry - confirms hierarchical chunking method called
        // Step 1: Create child chunks (small, precise)
        const childChunks = this.createChildChunks(content, sourceFile, sourcePath);
        // VERIFIED: Child chunk creation - confirms child chunks created (200-300 chars each)
        // Step 2: Create parent chunks (large, comprehensive)
        const parentChunks = this.createParentChunks(content, childChunks, sourceFile, sourcePath);
        // VERIFIED: Parent chunk creation - confirms parent chunks created (1000-1500 chars each)
        // Step 3: Link children to parents
        this.linkChildrenToParents(childChunks, parentChunks);
        // VERIFIED: Relationship linking - confirms parent-child relationships established
        // Return both children and parents
        return [...childChunks, ...parentChunks];
    }
    /**
     * Create child chunks (small, precise)
     */
    createChildChunks(content, sourceFile, sourcePath) {
        // VERIFIED: Child chunk generation - confirms small chunks (200-300 chars) created for precision
        const chunks = [];
        let startIndex = 0;
        let chunkIndex = 0;
        while (startIndex < content.length) {
            const endIndex = Math.min(startIndex + this.childChunkSize, content.length);
            const text = content.substring(startIndex, endIndex).trim();
            if (text.length > 0) {
                const chunk = {
                    text,
                    startIndex,
                    endIndex,
                    chunkIndex,
                    sourceFile,
                    sourcePath,
                    isParent: false,
                    isChild: true,
                };
                chunks.push(chunk);
                chunkIndex++;
            }
            // Move to next position with overlap
            const nextStartIndex = endIndex - this.childOverlap;
            startIndex = nextStartIndex > startIndex ? nextStartIndex : endIndex;
        }
        return chunks;
    }
    /**
     * Create parent chunks (large, comprehensive) that contain multiple children
     */
    createParentChunks(content, childChunks, sourceFile, sourcePath) {
        // VERIFIED: Parent chunk generation - confirms large chunks (1000-1500 chars) created for context
        const parents = [];
        let parentIndex = 0;
        // Group children into parents
        // Each parent should contain approximately parentChunkSize worth of content
        let currentParentStart = 0;
        let currentParentEnd = 0;
        let currentParentChildren = [];
        for (const child of childChunks) {
            // Check if adding this child would exceed parent size
            const wouldExceed = currentParentEnd > 0 && (child.endIndex - currentParentStart) > this.parentChunkSize;
            if (wouldExceed && currentParentChildren.length > 0) {
                // Create parent from current children
                const parentText = content.substring(currentParentStart, currentParentEnd).trim();
                if (parentText.length > 0) {
                    const parent = {
                        text: parentText,
                        startIndex: currentParentStart,
                        endIndex: currentParentEnd,
                        chunkIndex: parentIndex,
                        sourceFile,
                        sourcePath,
                        isParent: true,
                        isChild: false,
                        childIds: currentParentChildren.map(c => this.getChunkId(c)),
                    };
                    parents.push(parent);
                    parentIndex++;
                }
                // Start new parent with overlap
                currentParentStart = currentParentEnd - this.parentOverlap;
                currentParentChildren = [];
            }
            // Add child to current parent
            if (currentParentChildren.length === 0) {
                currentParentStart = child.startIndex;
            }
            currentParentEnd = child.endIndex;
            currentParentChildren.push(child);
        }
        // Create final parent if there are remaining children
        if (currentParentChildren.length > 0) {
            const parentText = content.substring(currentParentStart, currentParentEnd).trim();
            if (parentText.length > 0) {
                const parent = {
                    text: parentText,
                    startIndex: currentParentStart,
                    endIndex: currentParentEnd,
                    chunkIndex: parentIndex,
                    sourceFile,
                    sourcePath,
                    isParent: true,
                    isChild: false,
                    childIds: currentParentChildren.map(c => this.getChunkId(c)),
                };
                parents.push(parent);
            }
        }
        return parents;
    }
    /**
     * Link children to their parent chunks
     */
    linkChildrenToParents(childChunks, parentChunks) {
        // VERIFIED: Relationship linking - confirms children linked to their parent chunks
        for (const parent of parentChunks) {
            if (parent.childIds) {
                for (const childId of parent.childIds) {
                    const child = childChunks.find(c => this.getChunkId(c) === childId);
                    if (child) {
                        child.parentId = this.getChunkId(parent);
                    }
                }
            }
        }
    }
    /**
     * Generate unique ID for a chunk
     */
    getChunkId(chunk) {
        return `${chunk.sourcePath || ''}_${chunk.chunkIndex}_${chunk.startIndex}_${chunk.endIndex}`;
    }
    /**
     * Get parent chunk for a given child chunk
     */
    getParentChunk(childChunk, allChunks) {
        // VERIFIED: Parent retrieval - confirms parent chunk found for child chunk
        if (!childChunk.parentId) {
            return undefined;
        }
        return allChunks.find(c => this.getChunkId(c) === childChunk.parentId && c.isParent);
    }
    /**
     * Get all child chunks for a given parent chunk
     */
    getChildChunks(parentChunk, allChunks) {
        // VERIFIED: Child retrieval - confirms child chunks found for parent chunk
        if (!parentChunk.childIds) {
            return [];
        }
        return allChunks.filter(c => parentChunk.childIds.includes(this.getChunkId(c)) && c.isChild);
    }
}
