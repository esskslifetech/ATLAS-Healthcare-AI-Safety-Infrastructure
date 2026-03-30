#!/usr/bin/env node

// Demo script to run the ATLAS Care Coordinator
const { createCareCoordinator } = require('./dist/index.js');

async function runDemo() {
  console.log('🏥 ATLAS Care Coordinator Demo');
  console.log('================================');

  try {
    // Create a coordinator instance
    const coordinator = createCareCoordinator({
      agentId: 'atlas-coordinator-demo',
      defaultTimeoutMs: 30000,
      enableMetrics: true,
      enableEventLogging: true,
      enableTracing: true,
    });

    console.log('✅ Care Coordinator created successfully');
    console.log('📊 Agent Info:', coordinator.getAgentInfo());

    // Create a sample coordination request
    const request = {
      patient_id: 'patient-12345',
      trigger: 'PATIENT_INITIATED',
      initial_data: {
        symptoms: ['chest pain', 'shortness of breath', 'dizziness'],
        chief_complaint: 'Chest pain and difficulty breathing',
        urgency: 'EMERGENT',
        channel: 'chat',
      },
      context: {
        time_of_day: new Date().toISOString(),
        location: 'Home',
        available_resources: ['ER', 'Urgent Care', 'Primary Care'],
        insurance_info: 'PPO - Blue Cross',
        preferences: {
          language: 'English',
          facility: 'St. Mary\'s Hospital',
        },
      },
    };

    console.log('\n🚀 Starting care coordination...');
    console.log('📋 Request:', JSON.stringify(request, null, 2));

    // Start the coordination process
    const result = await coordinator.coordinateCare(request);

    if (result.ok) {
      console.log('\n✅ Care coordination completed successfully!');
      console.log('📈 Result:', JSON.stringify(result.value, null, 2));
    } else {
      console.log('\n❌ Care coordination failed:', result.error.message);
      console.log('🔍 Error details:', result.error);
    }

    // Show metrics
    console.log('\n📊 Performance Metrics:');
    const metrics = coordinator.getMetrics();
    console.log(JSON.stringify(metrics, null, 2));

    // Show active sessions
    console.log('\n📋 Active Sessions:');
    const activeSessionsResult = await coordinator.listActiveSessions();
    if (activeSessionsResult.ok) {
      console.log(`Found ${activeSessionsResult.value.length} active sessions`);
      activeSessionsResult.value.forEach((session, index) => {
        console.log(`  ${index + 1}. Session ${session.session_id} - State: ${session.state}`);
      });
    } else {
      console.log('Failed to get active sessions:', activeSessionsResult.error);
    }

    // Show health status
    console.log('\n🏥 System Health:');
    const health = await coordinator.getHealth();
    console.log(JSON.stringify(health, null, 2));

    // Gracefully shutdown
    console.log('\n🔄 Shutting down coordinator...');
    coordinator.shutdown();
    console.log('✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// Run the demo
runDemo().catch(console.error);
