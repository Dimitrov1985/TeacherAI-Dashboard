import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

export interface DetailedActivity {
  type: string
  title: string
  duration: string
  goal: string
  instructions: string[]
}

export interface LessonPlan {
  title: string
  objectives: string[]
  flashcards: Array<{ front: string; back: string }>
  activities: (string | DetailedActivity)[]
  materialsNeeded: string[]
}

export async function exportLessonPlanToWord(plan: LessonPlan): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: plan.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Objectives Section
          new Paragraph({
            text: 'Lesson Objectives',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          ...plan.objectives.map(
            (objective, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${objective}`,
                  }),
                ],
                spacing: {
                  after: 100,
                },
                bullet: {
                  level: 0,
                },
              }),
          ),

          // Activities Section
          new Paragraph({
            text: 'Classroom Activities',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          ...plan.activities.flatMap((activity, index) => {
            if (typeof activity === 'string') {
              // Old format: simple string
              return [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${activity}`,
                    }),
                  ],
                  spacing: {
                    after: 100,
                  },
                  bullet: {
                    level: 0,
                  },
                }),
              ]
            } else {
              // New format: detailed activity object
              const typeEmojis: Record<string, string> = {
                warmup: '🔥',
                main: '📚',
                practice: '✍️',
                review: '✅'
              }
              const emoji = typeEmojis[activity.type] || '📌'

              return [
                // Activity header
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${emoji} ${activity.title}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: {
                    before: 200,
                    after: 100,
                  },
                }),
                // Type and duration
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Type: ${activity.type} | Duration: ${activity.duration}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                  spacing: {
                    after: 80,
                  },
                }),
                // Goal
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `🎯 Goal: `,
                      bold: true,
                    }),
                    new TextRun({
                      text: activity.goal,
                    }),
                  ],
                  spacing: {
                    after: 80,
                  },
                }),
                // Instructions header
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Step-by-step Instructions:',
                      bold: true,
                    }),
                  ],
                  spacing: {
                    after: 60,
                  },
                }),
                // Instructions list
                ...activity.instructions.map(
                  (instruction, i) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${i + 1}. ${instruction}`,
                        }),
                      ],
                      spacing: {
                        after: 60,
                      },
                      bullet: {
                        level: 0,
                      },
                    })
                ),
              ]
            }
          }),

          // Materials Needed Section
          new Paragraph({
            text: 'Materials Needed',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          ...plan.materialsNeeded.map(
            (material) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: material,
                  }),
                ],
                spacing: {
                  after: 100,
                },
                bullet: {
                  level: 0,
                },
              }),
          ),

          // Flashcards Section
          new Paragraph({
            text: 'Flashcards',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          }),

          // Flashcards Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Question/Term',
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    shading: {
                      fill: 'E8E8E8',
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Answer/Definition',
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    shading: {
                      fill: 'E8E8E8',
                    },
                  }),
                ],
              }),
              // Data rows
              ...plan.flashcards.map(
                (card) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: card.front,
                          }),
                        ],
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1 },
                          bottom: { style: BorderStyle.SINGLE, size: 1 },
                          left: { style: BorderStyle.SINGLE, size: 1 },
                          right: { style: BorderStyle.SINGLE, size: 1 },
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: card.back,
                          }),
                        ],
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1 },
                          bottom: { style: BorderStyle.SINGLE, size: 1 },
                          left: { style: BorderStyle.SINGLE, size: 1 },
                          right: { style: BorderStyle.SINGLE, size: 1 },
                        },
                      }),
                    ],
                  }),
              ),
            ],
          }),

          // Footer
          new Paragraph({
            text: '',
            spacing: {
              before: 400,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created: ${new Date().toLocaleDateString('en-US')}`,
                italics: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  })

  // Generate and download the document
  const blob = await Packer.toBlob(doc)
  const fileName = `${plan.title.replace(/[^a-zа-яё0-9\s]/gi, '_')}_${Date.now()}.docx`
  saveAs(blob, fileName)
}
