using HRMSWebAPI.Repository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace HRMSWebAPI.Services
{
    public class RecurringTaskHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RecurringTaskHostedService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromMinutes(15);

        public RecurringTaskHostedService(
            IServiceScopeFactory scopeFactory,
            ILogger<RecurringTaskHostedService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RecurringTaskHostedService started.");

            // Wait 5 seconds after startup before initial evaluation
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            // Run initial processing on startup
            await ProcessDueTasksAsync();

            using var timer = new PeriodicTimer(_period);
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                await ProcessDueTasksAsync();
            }

            _logger.LogInformation("RecurringTaskHostedService is stopping.");
        }

        private async Task ProcessDueTasksAsync()
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<ITaskManagerRepository>();

                int generatedCount = await repository.ProcessRecurringTasksAsync();
                if (generatedCount > 0)
                {
                    _logger.LogInformation("RecurringTaskHostedService generated {Count} recurring task instances.", generatedCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing recurring task generation in RecurringTaskHostedService.");
            }
        }
    }
}

