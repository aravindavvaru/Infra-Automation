const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/apps', (req, res) => {
    exec('kubectl get kustomizations -A -o json', (err, stdout, stderr) => {
        if (err) return res.status(500).json({ error: stderr });

        try {
            const parsed = JSON.parse(stdout);
            const results = parsed.items.map(item => ({
                name: item.metadata.name,
                namespace: item.metadata.namespace,
                status: item.status?.conditions?.[0]?.type || 'Unknown',
                syncTime: item.status?.lastAppliedRevision || 'N/A',
                revision: item.status?.lastAppliedRevision || 'N/A',
            }));
            res.json(results);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse Flux data' });
        }
    });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
