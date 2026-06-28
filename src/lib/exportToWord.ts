import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

export interface LessonPlan {
  title: string
  objectives: string[]
  flashcards: Array<{ front: string; back: string }>
  activities: string[]
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
            text: 'Цели урока',
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
            text: 'Классные активности',
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          ...plan.activities.map(
            (activity, index) =>
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
          ),

          // Materials Needed Section
          new Paragraph({
            text: 'Необходимые материалы',
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
            text: 'Карточки для запоминания',
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
                            text: 'Вопрос/Термин',
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
                            text: 'Ответ/Определение',
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
                text: `Создано: ${new Date().toLocaleDateString('ru-RU')}`,
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
