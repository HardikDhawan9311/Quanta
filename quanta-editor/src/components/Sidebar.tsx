import React, { useState } from 'react';

interface SidebarProps {
    projectRoot: string | null;
    tree: FileNode[];
    onOpenFile: (path: string, name: string) => void;
    onOpenFolder: () => void;
}

const IconChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
    </svg>
);

const IconChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.646 4.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L8.293 8 5.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
);

const IconFile = () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5L10 0H4Zm6 1v3.5A1.5 1.5 0 0 0 11.5 6H15v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6Z" />
    </svg>
);

const IconFolder = ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        {open ? (
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" />
        ) : (
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Z" />
        )}
    </svg>
);

const FileTreeNode = ({ node, level, onOpenFile }: { node: FileNode; level: number; onOpenFile: (path: string, name: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    if (node.isDirectory) {
        return (
            <div>
                <div
                    className="sidebar-item"
                    style={{ paddingLeft: `${Math.max(8, level * 12)}px` }}
                    onClick={toggleOpen}
                >
                    <span className="sidebar-icon-caret">{isOpen ? <IconChevronDown /> : <IconChevronRight />}</span>
                    <span className="sidebar-icon-folder"><IconFolder open={isOpen} /></span>
                    <span className="sidebar-item-name">{node.name}</span>
                </div>
                {isOpen && node.children && (
                    <div className="sidebar-children">
                        {node.children.map(child => (
                            <FileTreeNode key={child.path} node={child} level={level + 1} onOpenFile={onOpenFile} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="sidebar-item file"
            style={{ paddingLeft: `${Math.max(24, level * 12 + 16)}px` }}
            onClick={() => onOpenFile(node.path, node.name)}
        >
            <span className="sidebar-icon-file"><IconFile /></span>
            <span className="sidebar-item-name">{node.name}</span>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ projectRoot, tree, onOpenFile, onOpenFolder }) => {
    return (
        <div className="vs-sidebar">
            <div className="sidebar-header">
                <h3>EXPLORER</h3>
            </div>
            {projectRoot ? (
                <div className="sidebar-tree">
                    <div className="sidebar-root-name">
                        <span className="sidebar-icon-caret"><IconChevronDown /></span>
                        PROJECT ({projectRoot.split(/[/\\]/).pop()})
                    </div>
                    {tree.map(node => (
                        <FileTreeNode key={node.path} node={node} level={1} onOpenFile={onOpenFile} />
                    ))}
                </div>
            ) : (
                <div className="sidebar-empty">
                    <p>You have not yet opened a folder.</p>
                    <button className="btn btn-primary btn-full" onClick={onOpenFolder}>Open Folder</button>
                </div>
            )}
        </div>
    );
};
