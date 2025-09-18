import React from 'react';
import { X, Download, ExternalLink, FileText, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    type: string;
    content: string;
    confidence: string;
    lastModified: string;
    size: string;
    relevance: number;
    author?: string;
    tags?: string[];
  } | null;
}

export function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
  if (!document) return null;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const mockContent = `
# ${document.title}

## Executive Summary

This document provides comprehensive guidelines for implementing enterprise-grade security measures across all organizational systems and processes. The recommendations outlined here are based on industry best practices and regulatory compliance requirements.

## Key Security Principles

### 1. Defense in Depth
Implement multiple layers of security controls to protect against various threat vectors:
- Network security perimeter controls
- Application-level security measures  
- Data encryption at rest and in transit
- Identity and access management

### 2. Principle of Least Privilege
Grant users and systems only the minimum level of access required to perform their functions:
- Role-based access control (RBAC)
- Regular access reviews and audits
- Automated provisioning and deprovisioning
- Privileged account management

### 3. Zero Trust Architecture
Never trust, always verify - implement continuous authentication and authorization:
- Multi-factor authentication (MFA) for all accounts
- Device compliance verification
- Network micro-segmentation
- Continuous monitoring and threat detection

## Implementation Guidelines

### Phase 1: Assessment and Planning
1. Conduct comprehensive security risk assessment
2. Identify critical assets and data flows
3. Define security requirements and compliance needs
4. Develop implementation roadmap and timeline

### Phase 2: Core Infrastructure
1. Deploy endpoint detection and response (EDR) solutions
2. Implement network segmentation and monitoring
3. Establish centralized logging and SIEM capabilities
4. Configure backup and disaster recovery systems

### Phase 3: Application Security
1. Integrate security into development lifecycle (DevSecOps)
2. Implement application security testing (SAST/DAST)
3. Deploy web application firewalls (WAF)
4. Establish secure code review processes

## Compliance Framework

This implementation aligns with the following standards:
- ISO 27001/27002 Information Security Management
- NIST Cybersecurity Framework
- SOC 2 Type II Controls
- GDPR Data Protection Requirements

For additional technical details and implementation specifics, please refer to the appendices and related documentation.
  `;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-popover border-border shadow-large">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-foreground mb-2">
                {document.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {document.type}
                </Badge>
                <Badge className={`text-xs ${getConfidenceColor(document.confidence)}`}>
                  {document.confidence} confidence
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {document.relevance}% relevance
                </Badge>
                {document.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{document.size}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{document.lastModified}</span>
            </div>
            {document.author && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{document.author}</span>
              </div>
            )}
            <div className="text-right text-muted-foreground">
              ID: {document.id}
            </div>
          </div>

          <ScrollArea className="h-96 border border-border rounded-lg bg-background p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {mockContent}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            This preview shows the document content as processed by Zyria's knowledge base.
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}