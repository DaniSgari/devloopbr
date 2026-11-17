/**
 * setup-notion-outreach.js
 * Cria automaticamente a base de dados de outreach no Notion.
 *
 * Como usar:
 *   1. Cria uma integração em notion.so/my-integrations → copia o secret_...
 *   2. Partilha uma página do Notion com essa integração (ver instruções no README)
 *   3. Copia o ID dessa página do URL (hash antes do ?)
 *   4. Corre: NOTION_TOKEN=secret_... NOTION_PARENT_PAGE_ID=xxx node setup-notion-outreach.js
 */

const token    = process.env.NOTION_TOKEN;
const parentId = process.env.NOTION_PARENT_PAGE_ID;

if (!token || !parentId) {
  console.error('\n❌  Missing env vars. Run as:\n');
  console.error('   NOTION_TOKEN=secret_... NOTION_PARENT_PAGE_ID=<page-id> node setup-notion-outreach.js\n');
  process.exit(1);
}

async function main() {
  console.log('\n🔧  Creating Notion database...\n');

  const res = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${token}`,
      'Content-Type':   'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: parentId },
      icon:   { type: 'emoji', emoji: '📬' },
      title:  [{ type: 'text', text: { content: 'Outreach Log' } }],
      properties: {
        'Name': {
          title: {},
        },
        'Company': {
          rich_text: {},
        },
        'Email': {
          email: {},
        },
        'Template': {
          select: {
            options: [
              { name: 'No website',  color: 'orange' },
              { name: 'Quick wins',  color: 'blue'   },
              { name: 'Big upgrade', color: 'purple' },
            ],
          },
        },
        'Observation': {
          rich_text: {},
        },
        'Date sent': {
          date: {},
        },
        'Status': {
          select: {
            options: [
              { name: 'Sent',          color: 'gray'   },
              { name: 'Replied',       color: 'blue'   },
              { name: 'Interested',    color: 'yellow' },
              { name: 'Not interested',color: 'red'    },
              { name: 'Converted',     color: 'green'  },
            ],
          },
        },
      },
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌  Notion API error:\n', JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const dbId  = json.id.replace(/-/g, '');
  const dbUrl = json.url;

  console.log('✅  Database created!\n');
  console.log('──────────────────────────────────────────');
  console.log(`📋  NOTION_DATABASE_ID = ${dbId}`);
  console.log('──────────────────────────────────────────\n');
  console.log(`🔗  Open in Notion: ${dbUrl}\n`);
  console.log('Next steps:');
  console.log('  1. Add NOTION_TOKEN and NOTION_DATABASE_ID to Netlify env vars');
  console.log('  2. netlify deploy --prod\n');
}

main().catch(err => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
