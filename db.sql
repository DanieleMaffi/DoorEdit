USE [master]
GO
/****** Object:  Database [ControlloAccessi]    Script Date: 11/08/2023 10:57:43 ******/
CREATE DATABASE [ControlloAccessi]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'ControlloAccessi', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\ControlloAccessi.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'ControlloAccessi_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\DATA\ControlloAccessi_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [ControlloAccessi] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ControlloAccessi].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ControlloAccessi] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ControlloAccessi] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ControlloAccessi] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ControlloAccessi] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ControlloAccessi] SET ARITHABORT OFF 
GO
ALTER DATABASE [ControlloAccessi] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [ControlloAccessi] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ControlloAccessi] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ControlloAccessi] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ControlloAccessi] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ControlloAccessi] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ControlloAccessi] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ControlloAccessi] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ControlloAccessi] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ControlloAccessi] SET  DISABLE_BROKER 
GO
ALTER DATABASE [ControlloAccessi] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ControlloAccessi] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ControlloAccessi] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ControlloAccessi] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ControlloAccessi] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ControlloAccessi] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ControlloAccessi] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ControlloAccessi] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [ControlloAccessi] SET  MULTI_USER 
GO
ALTER DATABASE [ControlloAccessi] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ControlloAccessi] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ControlloAccessi] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ControlloAccessi] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ControlloAccessi] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [ControlloAccessi] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [ControlloAccessi] SET QUERY_STORE = OFF
GO
USE [ControlloAccessi]
GO
/****** Object:  User [controlloaccessi]    Script Date: 11/08/2023 10:57:44 ******/
CREATE USER [controlloaccessi] FOR LOGIN [controlloaccessi] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [controlloaccessi]
GO
/****** Object:  Table [dbo].[tb_cfg_autorizzazioni]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_cfg_autorizzazioni](
	[rowID] [bigint] IDENTITY(1,1) NOT NULL,
	[ID_Terminale] [nvarchar](50) NOT NULL,
	[ID_Anagrafica] [bigint] NOT NULL,
 CONSTRAINT [PK_tb_cfg_autorizzazioni] PRIMARY KEY CLUSTERED 
(
	[rowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_cfg_anagrafica]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_cfg_anagrafica](
	[rowID] [bigint] IDENTITY(1,1) NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Cognome] [nvarchar](100) NOT NULL,
	[Abilitato] [bit] NOT NULL,
	[Badge_Timbrature] [nvarchar](50) NULL,
	[Badge_Accessi] [nvarchar](50) NULL,
	[Badge_Aggiuntivo] [nvarchar](50) NULL,
 CONSTRAINT [PK_tb_cfg_anagrafica] PRIMARY KEY CLUSTERED 
(
	[rowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_autorizzazioni]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_autorizzazioni]
AS
SELECT        dbo.tb_cfg_autorizzazioni.ID_Terminale, dbo.tb_cfg_anagrafica.Badge_Timbrature, dbo.tb_cfg_anagrafica.Badge_Accessi, dbo.tb_cfg_anagrafica.Badge_Aggiuntivo, dbo.tb_cfg_anagrafica.Abilitato, dbo.tb_cfg_anagrafica.Nome, 
                         dbo.tb_cfg_anagrafica.Cognome, dbo.tb_cfg_anagrafica.rowID AS ID_Anagrafica
FROM            dbo.tb_cfg_autorizzazioni INNER JOIN
                         dbo.tb_cfg_anagrafica ON dbo.tb_cfg_autorizzazioni.ID_Anagrafica = dbo.tb_cfg_anagrafica.rowID
GO
/****** Object:  Table [dbo].[IMPORT_Badge]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IMPORT_Badge](
	[rowID] [bigint] NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Cognome] [nvarchar](100) NOT NULL,
	[Abilitato] [int] NOT NULL,
	[Badge_Timbrature] [nvarchar](50) NULL,
	[Badge_Accessi] [nvarchar](50) NULL,
	[Badge_Aggiuntivo] [nvarchar](50) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_cfg_mail]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_cfg_mail](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[eMail] [nvarchar](50) NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_cfg_terminali]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_cfg_terminali](
	[rowID] [bigint] IDENTITY(1,1) NOT NULL,
	[Nome_Terminale] [nvarchar](50) NOT NULL,
	[ID_Terminale] [nvarchar](50) NOT NULL,
	[Indirizzo_Terminale] [nvarchar](50) NOT NULL,
	[Stato] [int] NOT NULL,
	[Contatore_Errori] [int] NOT NULL,
 CONSTRAINT [PK_tb_cfg_terminali] PRIMARY KEY CLUSTERED 
(
	[ID_Terminale] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_tb_cfg_terminali] UNIQUE NONCLUSTERED 
(
	[ID_Terminale] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [IX_tb_cfg_terminali_1] UNIQUE NONCLUSTERED 
(
	[Indirizzo_Terminale] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_log]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_log](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[Messaggio] [nvarchar](500) NOT NULL,
 CONSTRAINT [PK_tb_log] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_transiti]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_transiti](
	[rowID] [bigint] IDENTITY(1,1) NOT NULL,
	[Data] [datetime] NOT NULL,
	[Badge] [nvarchar](50) NOT NULL,
	[Nome] [nvarchar](100) NOT NULL,
	[Cognome] [nvarchar](100) NOT NULL,
	[Esito] [bit] NOT NULL,
	[Terminale] [nvarchar](50) NOT NULL,
	[IP] [nvarchar](50) NOT NULL,
	[Stato_Notifiche] [int] NOT NULL,
 CONSTRAINT [PK_tb_transiti] PRIMARY KEY CLUSTERED 
(
	[rowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tb_utenti]    Script Date: 11/08/2023 10:57:44 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tb_utenti](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](50) NOT NULL
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[tb_cfg_terminali] ADD  CONSTRAINT [DF_tb_cfg_terminali_Stato]  DEFAULT ((0)) FOR [Stato]
GO
ALTER TABLE [dbo].[tb_cfg_terminali] ADD  CONSTRAINT [DF_tb_cfg_terminali_Contatore_Errori]  DEFAULT ((0)) FOR [Contatore_Errori]
GO
ALTER TABLE [dbo].[tb_log] ADD  CONSTRAINT [DF_tb_log_Timestamp]  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[tb_transiti] ADD  CONSTRAINT [DF_tb_transiti_Stato_Notifiche]  DEFAULT ((0)) FOR [Stato_Notifiche]
GO
ALTER TABLE [dbo].[tb_cfg_autorizzazioni]  WITH CHECK ADD  CONSTRAINT [FK_tb_cfg_autorizzazioni_tb_cfg_anagrafica] FOREIGN KEY([ID_Anagrafica])
REFERENCES [dbo].[tb_cfg_anagrafica] ([rowID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[tb_cfg_autorizzazioni] CHECK CONSTRAINT [FK_tb_cfg_autorizzazioni_tb_cfg_anagrafica]
GO
ALTER TABLE [dbo].[tb_cfg_autorizzazioni]  WITH CHECK ADD  CONSTRAINT [FK_tb_cfg_autorizzazioni_tb_cfg_terminali] FOREIGN KEY([ID_Terminale])
REFERENCES [dbo].[tb_cfg_terminali] ([ID_Terminale])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[tb_cfg_autorizzazioni] CHECK CONSTRAINT [FK_tb_cfg_autorizzazioni_tb_cfg_terminali]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "tb_cfg_autorizzazioni"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 232
               Right = 228
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "tb_cfg_anagrafica"
            Begin Extent = 
               Top = 6
               Left = 266
               Bottom = 241
               Right = 456
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vw_autorizzazioni'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'VIEW',@level1name=N'vw_autorizzazioni'
GO
USE [master]
GO
ALTER DATABASE [ControlloAccessi] SET  READ_WRITE 
GO
